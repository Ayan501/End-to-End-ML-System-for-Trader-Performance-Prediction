# Trader Performance vs Market Sentiment

### Primetrade.ai — Data Science Internship Assignment

**Author:** Ayan Mansoori  
**Dataset:** Hyperliquid Trader Data + Bitcoin Fear/Greed Index

---

## Objective

Analyze how market sentiment (Fear vs Greed) impacts trader behavior and performance, and derive data-driven trading strategies.


---

## Project Structure

```
primetrade-assignment/
├── data/
│   ├── fear_greed_index.csv      # 2,644 rows — daily sentiment
│   └── trader_data.csv           # 211,224 rows — Hyperliquid trades
├── notebooks/
│   └── analysis_chart.ipynb            # Section A And B is cover in this Complete analysis notebook
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

- Converted timestamps to daily level and aligned both datasets
- Aggregated trader data per account per day
- Engineered key features: PnL, win rate, trade frequency, position size, long/short ratio
- Compared performance across sentiment buckets
- Built a predictive model to validate patterns

### Analysis

- Grouped by sentiment category (Extreme Fear → Extreme Greed)
- Computed performance metrics per sentiment bucket
- Segmented traders into: Winners/Losers, High/Low Frequency, Small/Mid/Large Position size
- Built Random Forest classifier (84.36% accuracy) to predict PnL bucket

---

## Insights and Impact

| # | Insight                                  | Impact                                          |
| - | ---------------------------------------- | ----------------------------------------------- |
| 1 | Fear days are most profitable            | Panic creates mispricing → better opportunities |
| 2 | Greed increases size but reduces returns | Overconfidence → higher risk, lower returns     |
| 3 | Higher activity during Fear              | Volatility creates more trading opportunities   |



## Business Impact

Traders should increase activity during fear phases to capture opportunities
During greed phases, risk management becomes critical due to overconfidence
Market sentiment can be used as a decision-support signal, not just an indicator

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
