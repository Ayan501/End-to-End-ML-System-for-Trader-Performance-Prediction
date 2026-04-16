import json
import secrets
import sqlite3
from hashlib import sha256
from pathlib import Path
from uuid import uuid4

import pandas as pd
from flask import Flask, jsonify, request, send_from_directory
from sklearn.model_selection import train_test_split

from src.constants import ARTIFACTS_DIR
from src.pipeline.prediction_pipeline import PredictionPipeline


BASE_DIR = Path(__file__).resolve().parent
FEATURE_STORE_PATH = ARTIFACTS_DIR / "feature_store" / "trader_features.csv"
METRICS_PATH = ARTIFACTS_DIR / "model_trainer" / "metrics.json"
OUTPUTS_DIR = BASE_DIR / "outputs"
USER_DB_PATH = BASE_DIR / "data" / "users.db"
MODEL_FEATURES = [
    "trade_count",
    "total_pnl",
    "avg_size_usd",
    "total_fee",
    "avg_execution_price",
    "buy_ratio",
    "long_ratio",
    "unique_assets",
    "win_rate",
    "fg_value",
    "net_pnl_after_fee",
    "pnl_per_trade",
    "size_to_fee_ratio",
    "sentiment",
]
NUMERIC_MODEL_FEATURES = [feature for feature in MODEL_FEATURES if feature != "sentiment"]
ALLOWED_UPLOAD_SUFFIXES = {".csv", ".xls", ".xlsx"}


def get_db_connection() -> sqlite3.Connection:
    USER_DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(USER_DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def hash_password(password: str, salt: str) -> str:
    return sha256(f"{salt}:{password}".encode("utf-8")).hexdigest()


def serialize_user(row: sqlite3.Row) -> dict:
    return {
        "name": row["name"],
        "email": row["email"],
        "has_project_data": bool(row["has_project_data"]),
    }


def init_user_db() -> None:
    with get_db_connection() as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                salt TEXT NOT NULL,
                has_project_data INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                last_login_at TEXT
            )
            """
        )
        default_email = "admin@primetrade.local"
        existing_admin = connection.execute(
            "SELECT id FROM users WHERE email = ?",
            (default_email,),
        ).fetchone()
        if existing_admin is None:
            salt = secrets.token_hex(16)
            connection.execute(
                """
                INSERT INTO users (name, email, password_hash, salt, has_project_data)
                VALUES (?, ?, ?, ?, ?)
                """,
                (
                    "PrimeTrade Admin",
                    default_email,
                    hash_password("1234", salt),
                    salt,
                    1,
                ),
            )


init_user_db()


def load_feature_store() -> pd.DataFrame:
    return pd.read_csv(FEATURE_STORE_PATH)


def load_metrics() -> dict:
    with open(METRICS_PATH, encoding="utf-8") as file_obj:
        return json.load(file_obj)


def model_metadata() -> dict:
    metrics = load_metrics()
    model_path = ARTIFACTS_DIR / "model_trainer" / "model.pkl"
    return {
        "model_name": metrics["best_model_name"],
        "accuracy": round(float(metrics["best_model_score"] * 100), 2),
        "model_path": str(model_path),
        "model_updated_at": pd.Timestamp(model_path.stat().st_mtime, unit="s").isoformat(),
    }


def load_prediction_defaults(df: pd.DataFrame) -> dict:
    model_df = df.dropna(subset=["target_label"]).copy()
    drop_columns = ["Account", "trade_date", "next_day_pnl", "current_day_pnl", "target_label"]
    input_feature_df = model_df.drop(columns=drop_columns)
    target_series = model_df["target_label"]
    _, x_test, _, _ = train_test_split(
        input_feature_df,
        target_series,
        test_size=0.2,
        random_state=42,
        stratify=target_series,
    )
    return x_test.iloc[0][MODEL_FEATURES].to_dict()


def build_chart_gallery() -> list[dict]:
    chart_meta = {
        "charts1_performance.png": {
            "title": "Performance vs Sentiment",
            "caption": "Trader profitability mapped against market mood buckets.",
        },
        "outputschart2_behavior.png": {
            "title": "Behavior Snapshot",
            "caption": "Trade frequency and activity pattern under different regimes.",
        },
        "chart3_distribution.png": {
            "title": "PnL Distribution",
            "caption": "Distribution of outcomes across daily aggregated trading sessions.",
        },
        "chart4_segments.png": {
            "title": "Trader Segments",
            "caption": "Segment-level clustering of account behavior and outcomes.",
        },
        "chart5_timeline.png": {
            "title": "Timeline View",
            "caption": "Market sentiment and performance progression over time.",
        },
        "outputschart6_feature_importance.png": {
            "title": "Feature Importance",
            "caption": "Signals driving the strongest tree-based model decisions.",
        },
        "outputschart7_confusion_matrix.png": {
            "title": "Confusion Matrix",
            "caption": "Prediction strengths and misses across target buckets.",
        },
    }

    gallery = []
    for file_path in sorted(OUTPUTS_DIR.glob("*.png")):
        meta = chart_meta.get(
            file_path.name,
            {"title": file_path.stem.replace("_", " ").title(), "caption": "Project output chart"},
        )
        gallery.append(
            {
                "file": file_path.name,
                "url": f"/outputs/{file_path.name}",
                "title": meta["title"],
                "caption": meta["caption"],
            }
        )
    return gallery


def read_uploaded_table(uploaded_file) -> pd.DataFrame:
    suffix = Path(uploaded_file.filename or "").suffix.lower()
    if suffix not in ALLOWED_UPLOAD_SUFFIXES:
        raise ValueError("Only CSV, XLS, and XLSX files are supported.")

    if suffix == ".csv":
        return pd.read_csv(uploaded_file)

    return pd.read_excel(uploaded_file)


def summarize_table(df: pd.DataFrame) -> dict:
    numeric_cols = df.select_dtypes(include="number").columns.tolist()
    chart_cols = numeric_cols[:8]
    chart_data = [
        {"name": col, "value": round(float(df[col].dropna().mean()), 4)}
        for col in chart_cols
        if not df[col].dropna().empty
    ]

    date_cols = [
        col
        for col in df.columns
        if "date" in col.lower() or "time" in col.lower()
    ]
    timeline = []
    if date_cols and numeric_cols:
        date_col = date_cols[0]
        value_col = "total_pnl" if "total_pnl" in df.columns else numeric_cols[0]
        timeline_df = df[[date_col, value_col]].copy()
        timeline_df[date_col] = pd.to_datetime(timeline_df[date_col], errors="coerce")
        timeline_df[value_col] = pd.to_numeric(timeline_df[value_col], errors="coerce")
        timeline_df = timeline_df.dropna().sort_values(date_col).tail(20)
        timeline = [
            {
                "name": row[date_col].strftime("%Y-%m-%d"),
                "value": round(float(row[value_col]), 4),
            }
            for _, row in timeline_df.iterrows()
        ]

    return {
        "rows": int(len(df)),
        "columns": int(len(df.columns)),
        "numeric_columns": int(len(numeric_cols)),
        "missing_values": int(df.isna().sum().sum()),
        "chart_data": chart_data,
        "timeline": timeline,
        "preview": df.head(8).fillna("").to_dict(orient="records"),
    }


def prepare_prediction_frame(df: pd.DataFrame) -> tuple[pd.DataFrame | None, list[str]]:
    missing_columns = [feature for feature in MODEL_FEATURES if feature not in df.columns]
    if missing_columns:
        return None, missing_columns

    features = df[MODEL_FEATURES].copy()
    for col in NUMERIC_MODEL_FEATURES:
        features[col] = pd.to_numeric(features[col], errors="coerce")
        features[col] = features[col].fillna(features[col].median())

    features["sentiment"] = features["sentiment"].fillna("Neutral").astype(str)
    return features, []


def build_decision(prediction_counts: dict, df: pd.DataFrame) -> dict:
    total_predictions = max(sum(prediction_counts.values()), 1)
    win_count = prediction_counts.get("big_win", 0) + prediction_counts.get("small_win", 0)
    loss_count = prediction_counts.get("big_loss", 0) + prediction_counts.get("small_loss", 0)
    win_share = win_count / total_predictions
    avg_pnl = float(pd.to_numeric(df.get("total_pnl", pd.Series([0])), errors="coerce").mean())
    avg_win_rate = float(pd.to_numeric(df.get("win_rate", pd.Series([0])), errors="coerce").mean())

    if win_share >= 0.62 and avg_pnl >= 0:
        action = "Increase exposure carefully"
        rationale = "Model output is mostly positive and average PnL is not under pressure."
    elif loss_count > win_count or avg_pnl < 0:
        action = "Reduce risk and review trades"
        rationale = "Loss buckets or negative PnL are stronger, so position sizing should stay defensive."
    elif avg_win_rate >= 0.55:
        action = "Hold strategy with tighter monitoring"
        rationale = "Win rate is healthy, but model output is mixed."
    else:
        action = "Wait for cleaner signal"
        rationale = "The uploaded data does not yet show a strong advantage."

    return {
        "action": action,
        "confidence": round(float(max(win_share, 1 - win_share) * 100), 2),
        "rationale": rationale,
        "positive_share": round(float(win_share * 100), 2),
    }


app = Flask(__name__, static_folder=str(BASE_DIR / "frontend" / "dist"), static_url_path="/")


@app.get("/api/health")
def health_check():
    return jsonify({"status": "ok"})


@app.post("/api/login")
def login():
    payload = request.get_json(force=True)
    email = str(payload.get("email", "")).strip()
    password = str(payload.get("password", ""))

    with get_db_connection() as connection:
        user = connection.execute(
            "SELECT * FROM users WHERE email = ?",
            (email,),
        ).fetchone()

        if user is None or user["password_hash"] != hash_password(password, user["salt"]):
            return jsonify({"message": "Email ya password galat hai."}), 401

        connection.execute(
            "UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?",
            (user["id"],),
        )

    return jsonify({"token": f"demo-{uuid4()}", "user": serialize_user(user)})


@app.post("/api/register")
def register():
    payload = request.get_json(force=True)
    name = str(payload.get("name", "")).strip() or "PrimeTrade User"
    email = str(payload.get("email", "")).strip().lower()
    password = str(payload.get("password", ""))

    if "@" not in email or len(password) < 4:
        return jsonify({"message": "Valid email aur minimum 4 character password chahiye."}), 400

    salt = secrets.token_hex(16)
    try:
        with get_db_connection() as connection:
            connection.execute(
                """
                INSERT INTO users (name, email, password_hash, salt, has_project_data)
                VALUES (?, ?, ?, ?, 0)
                """,
                (name, email, hash_password(password, salt), salt),
            )
            user = connection.execute(
                "SELECT * FROM users WHERE email = ?",
                (email,),
            ).fetchone()
    except sqlite3.IntegrityError:
        return jsonify({"message": "Is email se account already bana hua hai."}), 409

    return jsonify({"token": f"demo-{uuid4()}", "user": serialize_user(user)}), 201


@app.get("/api/dashboard")
def dashboard_data():
    df = load_feature_store()
    metrics = load_metrics()

    top_sentiments = (
        df.groupby("sentiment", as_index=False)
        .agg(avg_pnl=("total_pnl", "mean"), avg_win_rate=("win_rate", "mean"), trades=("trade_count", "sum"))
        .sort_values("avg_pnl", ascending=False)
    )

    timeline = (
        df.groupby("trade_date", as_index=False)
        .agg(total_pnl=("total_pnl", "sum"), avg_fg_value=("fg_value", "mean"))
        .tail(12)
    )

    page_stats = [
        {"label": "Feature Store Rows", "value": int(len(df))},
        {"label": "Accounts", "value": int(df["Account"].nunique())},
        {"label": "Avg Win Rate", "value": round(float(df["win_rate"].mean() * 100), 2)},
        {"label": "Best Model Accuracy", "value": round(float(metrics["best_model_score"] * 100), 2)},
    ]

    model_cards = [
        {
            "name": model_name,
            "accuracy": round(model_payload["test_accuracy"] * 100, 2),
            "f1": round(model_payload["test_weighted_f1"] * 100, 2),
            "train_accuracy": round(model_payload["train_accuracy"] * 100, 2),
        }
        for model_name, model_payload in metrics["all_models"].items()
    ]

    prediction_defaults = load_prediction_defaults(df)

    return jsonify(
        {
            "headline": {
                "title": "PrimeTrade Analytics Control Room",
                "subtitle": "Fear & Greed sentiment mapped with trader behavior and live PnL-bucket prediction.",
            },
            "stats": page_stats,
            "sentiment_breakdown": top_sentiments.to_dict(orient="records"),
            "timeline": timeline.to_dict(orient="records"),
            "model_cards": model_cards,
            "best_model_name": metrics["best_model_name"],
            "prediction_defaults": prediction_defaults,
            "chart_gallery": build_chart_gallery(),
            "model_metadata": model_metadata(),
        }
    )


@app.post("/api/predict")
def predict():
    payload = request.get_json(force=True)
    features = pd.DataFrame([payload])
    prediction = PredictionPipeline().predict(features)[0]
    return jsonify({"prediction": prediction, **model_metadata()})


@app.get("/api/model-info")
def model_info():
    return jsonify(model_metadata())


@app.post("/api/analyze-file")
def analyze_file():
    if "file" not in request.files:
        return jsonify({"message": "Upload a CSV, XLS, or XLSX file."}), 400

    try:
        df = read_uploaded_table(request.files["file"])
        summary = summarize_table(df)
        features, missing_columns = prepare_prediction_frame(df)
        prediction_payload = {
            "ready": False,
            "missing_columns": missing_columns,
            "counts": {},
            "decision": {
                "action": "Upload model-ready columns",
                "confidence": 0,
                "rationale": "ML prediction needs the same feature columns used during training.",
                "positive_share": 0,
            },
        }

        if features is not None and not features.empty:
            raw_predictions = PredictionPipeline().predict(features)
            prediction_counts = pd.Series(raw_predictions).value_counts().to_dict()
            prediction_payload = {
                "ready": True,
                "missing_columns": [],
                "counts": {str(key): int(value) for key, value in prediction_counts.items()},
                "decision": build_decision(prediction_counts, df),
            }

        return jsonify({"summary": summary, "prediction": prediction_payload})
    except ValueError as error:
        return jsonify({"message": str(error)}), 400
    except Exception as error:
        return jsonify({"message": "File analysis failed.", "detail": str(error)}), 500


@app.get("/outputs/<path:filename>")
def serve_output_file(filename: str):
    return send_from_directory(OUTPUTS_DIR, filename)


@app.get("/")
def serve_index():
    index_path = BASE_DIR / "frontend" / "dist" / "index.html"
    if index_path.exists():
        return app.send_static_file("index.html")
    return jsonify(
        {
            "message": "Frontend build not found yet. Run the React frontend separately in dev mode.",
            "api": ["/api/health", "/api/dashboard", "/api/predict"],
        }
    )


@app.get("/<path:path>")
def serve_spa(path: str):
    dist_dir = BASE_DIR / "frontend" / "dist"
    requested_file = dist_dir / path
    if requested_file.exists() and requested_file.is_file():
        return send_from_directory(dist_dir, path)

    index_path = dist_dir / "index.html"
    if index_path.exists():
        return app.send_static_file("index.html")

    return jsonify(
        {
            "message": "Frontend build not found yet. Run the React frontend separately in dev mode.",
            "requested_path": path,
        }
    ), 404


if __name__ == "__main__":
    app.run(debug=True, port=5000)
