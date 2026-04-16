# PrimeTrade ML Dashboard

PrimeTrade is an end-to-end machine learning dashboard for trader behavior analysis. It combines Hyperliquid-style trade history, Bitcoin Fear & Greed sentiment, model training artifacts, login/register flow, single-row prediction, and CSV/Excel upload analysis.

The app has two main parts:

- Flask backend for authentication, dashboard APIs, file analysis, and ML prediction
- React/Vite frontend for the dashboard UI, login flow, charts, upload page, and prediction console

## Current Features

- SQLite-backed login and account creation
- Existing admin account with real project data
- New accounts start from zero dashboard state
- Dashboard stats from processed feature data
- Model Arena with real model metrics
- Single-row prediction using the saved ML model
- CSV/XLS/XLSX upload to chart, preview, prediction buckets, and decision signal
- Test upload CSV included for quick verification

## Default Login

Use this account to see the real project/test data:

```text
Email: admin@primetrade.local
Password: 1234
```

Create Account is also available on the login screen. Newly created accounts are saved in the local SQLite database and start with zero dashboard values.

## Project Structure

```text
primetrade-assignment/
|-- app.py
|-- main.py
|-- predict.py
|-- requirements.txt
|-- setup.py
|-- data/
|   |-- historical_data.csv
|   |-- fear_greed_index.csv
|   |-- test_upload_model_ready.csv
|   |-- users.db
|-- artifacts/
|   |-- feature_store/
|   |-- model_trainer/
|   |-- transformation/
|-- frontend/
|   |-- src/
|   |-- dist/
|   |-- package.json
|-- notebooks/
|-- outputs/
|-- src/
|   |-- components/
|   |-- constants/
|   |-- entity/
|   |-- pipeline/
|   |-- exception.py
|   |-- logger.py
|   |-- utils.py
```

## Setup

Install Python dependencies:

```bash
pip install -r requirements.txt
```

Install frontend dependencies if needed:

```bash
cd frontend
npm install
```

## Run The App

From the project root:

```bash
python app.py
```

Open:

```text
http://127.0.0.1:5000
```

The Flask app serves the built frontend from `frontend/dist`.

For frontend development mode:

```bash
cd frontend
npm run dev
```

For production frontend build:

```bash
cd frontend
npm run build
```

## UI Flow

### Login Page

There are two modes:

- Login: existing users sign in from `data/users.db`
- Create Account: creates a new local user in `data/users.db`

Existing admin account has `has_project_data = true`, so it can see the real project data. New users have `has_project_data = false`, so the UI shows zero-state dashboard values until data is connected.

### Home

Shows a compact project overview, snapshot stats, and model summary.

Admin account displays real project data. New accounts display zero values.

### Dashboard

Main analytics page.

It shows:

- feature store row count
- account count
- average win rate
- best model accuracy
- sentiment performance bars
- PnL vs Fear & Greed timeline
- prediction console
- live snapshot
- model arena

The dashboard uses `/api/dashboard`.

### Reports

Report-style view for:

- sentiment performance
- PnL timeline

### Traders

Trader behavior summary page. Current live stats come from the processed feature store. Extra trader behavior cards are zero placeholders for future expansion.

### Models

Displays model comparison from `artifacts/model_trainer/metrics.json`.

Current best local model:

```text
RandomForestClassifier
Accuracy: 92.11%
Weighted F1: 92.08%
```

### Prediction

Single-row prediction console.

For the admin account, fields are auto-filled from the actual test split sample. When Run Prediction is clicked:

```text
frontend form -> /api/predict -> preprocessor.pkl -> model.pkl -> prediction result
```

The result includes:

- predicted PnL bucket
- model name
- model accuracy

### Upload

Upload CSV, XLS, or XLSX files.

The backend will:

- read the file with pandas
- calculate rows, columns, numeric columns, and missing values
- build chart data from numeric columns
- show first 8 preview rows
- check whether model-required columns exist
- run row-wise ML prediction if model columns are present
- generate a decision signal

Supported file types:

```text
.csv
.xls
.xlsx
```

Test upload file:

```text
data/test_upload_model_ready.csv
```

This file has model-ready test rows and can be uploaded directly on the Upload page.

### Settings

Placeholder page for future workspace settings. Current placeholder values are zeroed.

## Model Problem

The ML task predicts trader PnL bucket:

- `big_loss`
- `small_loss`
- `small_win`
- `big_win`

The processed dataset is account-date level trader behavior merged with Fear & Greed sentiment.

## Model Features

Required model columns:

```text
trade_count
total_pnl
avg_size_usd
total_fee
avg_execution_price
buy_ratio
long_ratio
unique_assets
win_rate
fg_value
net_pnl_after_fee
pnl_per_trade
size_to_fee_ratio
sentiment
```

If an uploaded file has these columns, the Upload page can run ML predictions. Extra columns are allowed and ignored by the model.

## Training Pipeline

Run training:

```bash
python main.py
```

Generated artifacts:

```text
artifacts/feature_store/trader_features.csv
artifacts/transformation/preprocessor.pkl
artifacts/transformation/train.pkl
artifacts/transformation/test.pkl
artifacts/model_trainer/model.pkl
artifacts/model_trainer/metrics.json
```

Compared models:

- `LogisticRegression`
- `RandomForestClassifier`
- `GradientBoostingClassifier`
- `ExtraTreesClassifier`

The best model is saved to:

```text
artifacts/model_trainer/model.pkl
```

## API Endpoints

```text
GET  /api/health
POST /api/login
POST /api/register
GET  /api/dashboard
GET  /api/model-info
POST /api/predict
POST /api/analyze-file
```

### Login

```http
POST /api/login
Content-Type: application/json

{
  "email": "admin@primetrade.local",
  "password": "1234"
}
```

### Register

```http
POST /api/register
Content-Type: application/json

{
  "name": "New User",
  "email": "new@example.com",
  "password": "1234"
}
```

### Predict

```http
POST /api/predict
Content-Type: application/json

{
  "trade_count": 51,
  "total_pnl": 446.358633,
  "avg_size_usd": 1384.944706,
  "total_fee": 14.131993,
  "avg_execution_price": 19.826549,
  "buy_ratio": 0.705882,
  "long_ratio": 0,
  "unique_assets": 2,
  "win_rate": 0.313725,
  "fg_value": 20,
  "net_pnl_after_fee": 432.22664,
  "pnl_per_trade": 8.75213,
  "size_to_fee_ratio": 91.524274,
  "sentiment": "Extreme Fear"
}
```

## CLI Prediction

```powershell
python predict.py `
  --trade-count 51 `
  --total-pnl 446.358633 `
  --avg-size-usd 1384.944706 `
  --total-fee 14.131993 `
  --avg-execution-price 19.826549 `
  --buy-ratio 0.705882 `
  --long-ratio 0 `
  --unique-assets 2 `
  --win-rate 0.313725 `
  --fg-value 20 `
  --net-pnl-after-fee 432.22664 `
  --pnl-per-trade 8.75213 `
  --size-to-fee-ratio 91.524274 `
  --sentiment "Extreme Fear"
```

## Notes

- `data/users.db` is local development authentication storage.
- Passwords are stored as salted SHA-256 hashes, not plain text.
- The decision signal on the Upload page is an ML project signal, not financial advice.
- `frontend/dist` is regenerated by `npm run build`.
- Logs are written under `logs/`.
