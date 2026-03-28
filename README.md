# Trader Performance vs Market Sentiment

### Primetrade.ai — Data Science Internship Assignment

**Author:** Ayan Mansuri  
**Dataset:** Hyperliquid Trader Data + Bitcoin Fear/Greed Index

---

## Project Structure

```
primetrade-assignment/
├── data/
│   ├── fear_greed_index.csv      # 2,644 rows — daily sentiment
│   └── trader_data.csv           # 211,224 rows — Hyperliquid trades
├── notebooks/
│   └── analysis.ipynb            # Section A And B is cover in this Complete analysis notebook
    |__ model.ipynb               # additional effort Build a Tree based ML Model with 84% accuracy
    |__ Insights_and_Strategy_Recommendations.txt    # This file Contain section C of the assignment
├── outputs/               # All 5 charts  + 2 model based chart (PNG)
├── README.md
└── requirements.txt
```

---

## Setup & RunS
```bash
# 1. Clone / download the repo
# 2. Install dependencies
pip install -r requirements.txt

# 3. Open notebook
jupyter notebook notebooks/analysis_chart.ipynb
```

---

## Methodology

### Data Preparation

- Loaded Fear/Greed Index (2,644 rows) and Hyperliquid Trader Data (211,224 rows)
- Parsed `Timestamp IST` to daily dates; merged both datasets on `date`
- Engineered features: daily PnL, win rate, trade frequency, long/short ratio, position size

### Analysis

- Grouped by sentiment category (Extreme Fear → Extreme Greed)
- Computed performance metrics per sentiment bucket
- Segmented traders into: Winners/Losers, High/Low Frequency, Small/Mid/Large Position size
- Built Random Forest classifier (84.36% accuracy) to predict PnL bucket

---

## Key Insights

| #   | Insight                                                                            | Evidence |
| --- | ---------------------------------------------------------------------------------- | -------- |
| 1   | **Fear days are most profitable** — Extreme Fear: avg $500 PnL vs Greed: -$86      | Chart 1  |
| 2   | **Greed inflates position size but kills returns** — $7,807 avg size on Greed days | Chart 2  |
| 3   | **Traders trade more frequently on Fear days** — 4.52 vs 3.87 trades/day           | Chart 2  |

---

## Strategy Recommendations

**Strategy 1 — Fear Accumulation Rule**  
When index < 30: increase frequency +20%, allow long exposure up to 60%, keep sizes moderate.

**Strategy 2 — Greed Brake Rule**  
When index > 60: cap position size at 50%, reduce leverage, prefer flat/short positions.

---

## Bonus: Predictive Model

- **Algorithm:** Random Forest Classifier
- **Target:** Next-day PnL bucket (Big Loss / Small Loss / Small Win / Big Win)
- **Features:** fg_value, sentiment, trade_count, avg_size, long_ratio, win_rate
- **Accuracy: 84.36%**
