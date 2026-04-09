import argparse

from src.pipeline.prediction_pipeline import PredictionPipeline, TraderFeatureInput


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run inference on trader features.")
    parser.add_argument("--trade-count", type=float, required=True)
    parser.add_argument("--total-pnl", type=float, required=True)
    parser.add_argument("--avg-size-usd", type=float, required=True)
    parser.add_argument("--total-fee", type=float, required=True)
    parser.add_argument("--avg-execution-price", type=float, required=True)
    parser.add_argument("--buy-ratio", type=float, required=True)
    parser.add_argument("--long-ratio", type=float, required=True)
    parser.add_argument("--unique-assets", type=float, required=True)
    parser.add_argument("--win-rate", type=float, required=True)
    parser.add_argument("--fg-value", type=float, required=True)
    parser.add_argument("--net-pnl-after-fee", type=float, required=True)
    parser.add_argument("--pnl-per-trade", type=float, required=True)
    parser.add_argument("--size-to-fee-ratio", type=float, required=True)
    parser.add_argument("--sentiment", type=str, required=True)
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    feature_input = TraderFeatureInput(
        trade_count=args.trade_count,
        total_pnl=args.total_pnl,
        avg_size_usd=args.avg_size_usd,
        total_fee=args.total_fee,
        avg_execution_price=args.avg_execution_price,
        buy_ratio=args.buy_ratio,
        long_ratio=args.long_ratio,
        unique_assets=args.unique_assets,
        win_rate=args.win_rate,
        fg_value=args.fg_value,
        net_pnl_after_fee=args.net_pnl_after_fee,
        pnl_per_trade=args.pnl_per_trade,
        size_to_fee_ratio=args.size_to_fee_ratio,
        sentiment=args.sentiment,
    )
    prediction = PredictionPipeline().predict(feature_input.to_dataframe())
    print(f"Predicted PnL bucket: {prediction[0]}")
