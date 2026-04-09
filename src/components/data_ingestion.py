import sys

import numpy as np
import pandas as pd

from src.entity.artifact_entity import DataIngestionArtifact
from src.entity.config_entity import DataIngestionConfig
from src.exception import CustomException
from src.logger import logging
from src.utils import ensure_parent_dir


class DataIngestion:
    def __init__(self, config: DataIngestionConfig = DataIngestionConfig()) -> None:
        self.config = config

    def _prepare_feature_store(
        self, trades_df: pd.DataFrame, sentiment_df: pd.DataFrame
    ) -> pd.DataFrame:
        trades_df = trades_df.copy()
        sentiment_df = sentiment_df.copy()

        trades_df["trade_date"] = pd.to_datetime(
            trades_df["Timestamp IST"], format="%d-%m-%Y %H:%M", errors="coerce"
        ).dt.date
        sentiment_df["date"] = pd.to_datetime(sentiment_df["date"], errors="coerce").dt.date

        trades_df["Closed PnL"] = pd.to_numeric(trades_df["Closed PnL"], errors="coerce").fillna(0.0)
        trades_df["Size USD"] = pd.to_numeric(trades_df["Size USD"], errors="coerce").fillna(0.0)
        trades_df["Fee"] = pd.to_numeric(trades_df["Fee"], errors="coerce").fillna(0.0)
        trades_df["Execution Price"] = pd.to_numeric(
            trades_df["Execution Price"], errors="coerce"
        ).fillna(0.0)

        aggregated = (
            trades_df.groupby(["Account", "trade_date"], as_index=False)
            .agg(
                trade_count=("Trade ID", "count"),
                total_pnl=("Closed PnL", "sum"),
                avg_size_usd=("Size USD", "mean"),
                total_fee=("Fee", "sum"),
                avg_execution_price=("Execution Price", "mean"),
                buy_ratio=("Side", lambda values: np.mean(pd.Series(values).str.upper() == "BUY")),
                long_ratio=(
                    "Direction",
                    lambda values: np.mean(pd.Series(values).fillna("").str.lower() == "long"),
                ),
                unique_assets=("Coin", "nunique"),
            )
        )

        win_stats = (
            trades_df.assign(is_profitable=(trades_df["Closed PnL"] > 0).astype(int))
            .groupby(["Account", "trade_date"], as_index=False)["is_profitable"]
            .mean()
            .rename(columns={"is_profitable": "win_rate"})
        )
        aggregated = aggregated.merge(win_stats, on=["Account", "trade_date"], how="left")

        feature_store_df = aggregated.merge(
            sentiment_df[["date", "value", "classification"]],
            left_on="trade_date",
            right_on="date",
            how="left",
        )
        feature_store_df = feature_store_df.drop(columns=["date"]).rename(
            columns={"value": "fg_value", "classification": "sentiment"}
        )
        feature_store_df["sentiment"] = feature_store_df["sentiment"].fillna("Unknown")
        feature_store_df["fg_value"] = feature_store_df["fg_value"].fillna(
            feature_store_df["fg_value"].median()
        )
        feature_store_df["net_pnl_after_fee"] = (
            feature_store_df["total_pnl"] - feature_store_df["total_fee"]
        )
        feature_store_df["pnl_per_trade"] = feature_store_df["total_pnl"] / feature_store_df[
            "trade_count"
        ].clip(lower=1)
        feature_store_df["size_to_fee_ratio"] = feature_store_df["avg_size_usd"] / (
            feature_store_df["total_fee"].abs() + 1.0
        )

        feature_store_df = feature_store_df.sort_values(["Account", "trade_date"]).reset_index(drop=True)
        feature_store_df["next_day_pnl"] = feature_store_df.groupby("Account")["total_pnl"].shift(-1)
        valid_target_mask = feature_store_df["next_day_pnl"].notna()
        feature_store_df.loc[valid_target_mask, "target_label"] = pd.qcut(
            feature_store_df.loc[valid_target_mask, "next_day_pnl"].rank(method="first"),
            q=4,
            labels=["big_loss", "small_loss", "small_win", "big_win"],
        )

        return feature_store_df.sort_values(["trade_date", "Account"]).reset_index(drop=True)

    def initiate_data_ingestion(self) -> DataIngestionArtifact:
        logging.info("Entered the data ingestion component")
        try:
            trades_df = pd.read_csv(self.config.raw_trade_data_path)
            sentiment_df = pd.read_csv(self.config.raw_sentiment_data_path)
            feature_store_df = self._prepare_feature_store(trades_df, sentiment_df)

            ensure_parent_dir(self.config.feature_store_path)
            feature_store_df.to_csv(self.config.feature_store_path, index=False)
            logging.info("Feature store created at %s", self.config.feature_store_path)

            return DataIngestionArtifact(feature_store_path=self.config.feature_store_path)
        except Exception as error:
            raise CustomException(error, sys) from error
