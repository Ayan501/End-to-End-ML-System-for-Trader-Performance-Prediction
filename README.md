# PrimeTrade End-to-End ML Project

Production-style machine learning project built on the PrimeTrade assignment dataset.
It converts the original notebook workflow into a reusable Python package with modular pipelines.

## Highlights

- `setup.py` based packaging
- custom logging and exception handling
- data ingestion, transformation, training, and prediction pipelines
- multiple ML model comparison
- persisted artifacts for preprocessing, metrics, and best model

## Project Structure

```text
primetrade-assignment/
|-- data/
|-- notebooks/
|-- outputs/
|-- artifacts/
|-- logs/
|-- src/
|   |-- components/
|   |-- constants/
|   |-- entity/
|   |-- pipeline/
|   |-- exception.py
|   |-- logger.py
|   |-- utils.py
|-- main.py
|-- predict.py
|-- setup.py
|-- requirements.txt
```

## Problem Statement

Hyperliquid trade history and Bitcoin Fear/Greed sentiment ko use karke next-day trader PnL bucket predict karna:

- `big_loss`
- `small_loss`
- `small_win`
- `big_win`

## Pipeline Flow

### Data ingestion

- reads `data/historical_data.csv`
- reads `data/fear_greed_index.csv`
- builds account-date level feature store
- saves processed data to `artifacts/feature_store/trader_features.csv`

### Feature engineering

Main features:

- `trade_count`
- `total_pnl`
- `avg_size_usd`
- `total_fee`
- `avg_execution_price`
- `buy_ratio`
- `long_ratio`
- `unique_assets`
- `win_rate`
- `fg_value`
- `net_pnl_after_fee`
- `pnl_per_trade`
- `size_to_fee_ratio`
- `sentiment`

### Model training

Compared models:

- `LogisticRegression`
- `RandomForestClassifier`
- `GradientBoostingClassifier`
- `ExtraTreesClassifier`

Best model, preprocessor, and metrics are saved automatically.

## Installation

```bash
pip install -r requirements.txt
pip install -e .
```

## Run Training

```bash
python main.py
```

Generated artifacts:

- `artifacts/feature_store/trader_features.csv`
- `artifacts/transformation/preprocessor.pkl`
- `artifacts/transformation/train.pkl`
- `artifacts/transformation/test.pkl`
- `artifacts/model_trainer/model.pkl`
- `artifacts/model_trainer/metrics.json`

## Run Prediction

```powershell
python predict.py `
  --trade-count 12 `
  --total-pnl 450 `
  --avg-size-usd 1800 `
  --total-fee 23 `
  --avg-execution-price 102000 `
  --buy-ratio 0.66 `
  --long-ratio 0.58 `
  --unique-assets 4 `
  --win-rate 0.62 `
  --fg-value 35 `
  --net-pnl-after-fee 427 `
  --pnl-per-trade 37.5 `
  --size-to-fee-ratio 75 `
  --sentiment Fear
```

## Run Dashboard

Backend API:

```bash
python app.py
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

This React UI is styled around the reference analytics dashboard look and includes a live prediction section connected to the ML model API.

## Current Local Result

Latest local run selected `RandomForestClassifier` with `0.4481` test accuracy for next-day PnL bucket prediction.

## Notes

- notebooks are preserved for EDA and analysis
- logs are generated in `logs/`
- custom exception flow is implemented across pipeline stages
