import sys
from dataclasses import dataclass

import pandas as pd

from src.constants import ARTIFACTS_DIR
from src.exception import CustomException
from src.utils import load_object


PREDICTION_MODEL_PATH = ARTIFACTS_DIR / "model_trainer" / "model.pkl"
PREDICTION_PREPROCESSOR_PATH = ARTIFACTS_DIR / "transformation" / "preprocessor.pkl"


@dataclass
class TraderFeatureInput:
    trade_count: float
    total_pnl: float
    avg_size_usd: float
    total_fee: float
    avg_execution_price: float
    buy_ratio: float
    long_ratio: float
    unique_assets: float
    win_rate: float
    fg_value: float
    net_pnl_after_fee: float
    pnl_per_trade: float
    size_to_fee_ratio: float
    sentiment: str

    def to_dataframe(self) -> pd.DataFrame:
        return pd.DataFrame([self.__dict__])


class PredictionPipeline:
    def __init__(self) -> None:
        self.model = load_object(PREDICTION_MODEL_PATH)
        self.preprocessor = load_object(PREDICTION_PREPROCESSOR_PATH)

    def predict(self, features: pd.DataFrame):
        try:
            transformed_features = self.preprocessor.transform(features)
            return self.model.predict(transformed_features)
        except Exception as error:
            raise CustomException(error, sys) from error
