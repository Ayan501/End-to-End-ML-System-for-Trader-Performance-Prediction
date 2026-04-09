import json
from pathlib import Path

import pandas as pd
from flask import Flask, jsonify, request, send_from_directory

from src.constants import ARTIFACTS_DIR
from src.pipeline.prediction_pipeline import PredictionPipeline


BASE_DIR = Path(__file__).resolve().parent
FEATURE_STORE_PATH = ARTIFACTS_DIR / "feature_store" / "trader_features.csv"
METRICS_PATH = ARTIFACTS_DIR / "model_trainer" / "metrics.json"
OUTPUTS_DIR = BASE_DIR / "outputs"


def load_feature_store() -> pd.DataFrame:
    return pd.read_csv(FEATURE_STORE_PATH)


def load_metrics() -> dict:
    with open(METRICS_PATH, encoding="utf-8") as file_obj:
        return json.load(file_obj)


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


app = Flask(__name__, static_folder=str(BASE_DIR / "frontend" / "dist"), static_url_path="/")


@app.get("/api/health")
def health_check():
    return jsonify({"status": "ok"})


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

    prediction_defaults = df.dropna(subset=["target_label"]).iloc[0][
        [
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
    ].to_dict()

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
        }
    )


@app.post("/api/predict")
def predict():
    payload = request.get_json(force=True)
    features = pd.DataFrame([payload])
    prediction = PredictionPipeline().predict(features)[0]
    return jsonify({"prediction": prediction})


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
