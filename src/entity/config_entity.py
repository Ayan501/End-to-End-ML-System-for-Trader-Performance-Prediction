from dataclasses import dataclass, field
from pathlib import Path

from src.constants import ARTIFACTS_DIR, RAW_SENTIMENT_DATA_PATH, RAW_TRADE_DATA_PATH


@dataclass(frozen=True)
class TrainingPipelineConfig:
    artifacts_dir: Path = ARTIFACTS_DIR


@dataclass(frozen=True)
class DataIngestionConfig:
    raw_trade_data_path: Path = RAW_TRADE_DATA_PATH
    raw_sentiment_data_path: Path = RAW_SENTIMENT_DATA_PATH
    feature_store_path: Path = ARTIFACTS_DIR / "feature_store" / "trader_features.csv"


@dataclass(frozen=True)
class DataTransformationConfig:
    preprocessor_obj_file_path: Path = ARTIFACTS_DIR / "transformation" / "preprocessor.pkl"
    target_column: str = "target_label"
    test_size: float = 0.2
    random_state: int = 42


@dataclass(frozen=True)
class ModelTrainerConfig:
    trained_model_file_path: Path = ARTIFACTS_DIR / "model_trainer" / "model.pkl"
    metrics_file_path: Path = ARTIFACTS_DIR / "model_trainer" / "metrics.json"
    expected_accuracy: float = 0.90
    random_state: int = 42
    model_params: dict = field(
        default_factory=lambda: {
            "LogisticRegression": {"max_iter": 1000},
            "RandomForestClassifier": {"n_estimators": 250, "random_state": 42},
            "GradientBoostingClassifier": {"random_state": 42},
            "ExtraTreesClassifier": {"n_estimators": 300, "random_state": 42},
        }
    )
