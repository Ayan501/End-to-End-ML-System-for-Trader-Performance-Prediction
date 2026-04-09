import sys

import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

from src.entity.artifact_entity import DataIngestionArtifact, DataTransformationArtifact
from src.entity.config_entity import DataTransformationConfig
from src.exception import CustomException
from src.logger import logging
from src.utils import save_object


class DataTransformation:
    def __init__(self, config: DataTransformationConfig = DataTransformationConfig()) -> None:
        self.config = config

    def get_data_transformer_object(self) -> ColumnTransformer:
        numerical_columns = [
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
        ]
        categorical_columns = ["sentiment"]

        numeric_pipeline = Pipeline(
            steps=[
                ("imputer", SimpleImputer(strategy="median")),
                ("scaler", StandardScaler()),
            ]
        )
        categorical_pipeline = Pipeline(
            steps=[
                ("imputer", SimpleImputer(strategy="most_frequent")),
                ("encoder", OneHotEncoder(handle_unknown="ignore")),
            ]
        )

        return ColumnTransformer(
            transformers=[
                ("numeric_pipeline", numeric_pipeline, numerical_columns),
                ("categorical_pipeline", categorical_pipeline, categorical_columns),
            ]
        )

    def initiate_data_transformation(
        self, data_ingestion_artifact: DataIngestionArtifact
    ) -> DataTransformationArtifact:
        logging.info("Entered the data transformation component")
        try:
            df = pd.read_csv(data_ingestion_artifact.feature_store_path)
            df = df.dropna(subset=[self.config.target_column]).copy()

            drop_columns = ["Account", "trade_date", "next_day_pnl", self.config.target_column]
            input_feature_df = df.drop(columns=drop_columns)
            target_series = df[self.config.target_column]

            x_train, x_test, y_train, y_test = train_test_split(
                input_feature_df,
                target_series,
                test_size=self.config.test_size,
                random_state=self.config.random_state,
                stratify=target_series,
            )

            preprocessor = self.get_data_transformer_object()
            x_train_arr = preprocessor.fit_transform(x_train)
            x_test_arr = preprocessor.transform(x_test)

            train_data = (x_train_arr, np.array(y_train))
            test_data = (x_test_arr, np.array(y_test))

            train_data_path = self.config.preprocessor_obj_file_path.parent / "train.pkl"
            test_data_path = self.config.preprocessor_obj_file_path.parent / "test.pkl"

            save_object(self.config.preprocessor_obj_file_path, preprocessor)
            save_object(train_data_path, train_data)
            save_object(test_data_path, test_data)

            logging.info("Data transformation completed successfully")
            return DataTransformationArtifact(
                train_data_path=train_data_path,
                test_data_path=test_data_path,
                preprocessor_path=self.config.preprocessor_obj_file_path,
            )
        except Exception as error:
            raise CustomException(error, sys) from error
