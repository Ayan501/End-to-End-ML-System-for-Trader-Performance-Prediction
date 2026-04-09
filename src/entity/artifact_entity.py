from dataclasses import dataclass
from pathlib import Path


@dataclass
class DataIngestionArtifact:
    feature_store_path: Path


@dataclass
class DataTransformationArtifact:
    train_data_path: Path
    test_data_path: Path
    preprocessor_path: Path


@dataclass
class ModelTrainerArtifact:
    trained_model_file_path: Path
    metrics_file_path: Path
    best_model_name: str
    test_accuracy: float
