import sys

from src.components.data_ingestion import DataIngestion
from src.components.data_transformation import DataTransformation
from src.components.model_trainer import ModelTrainer
from src.entity.artifact_entity import ModelTrainerArtifact
from src.exception import CustomException
from src.logger import logging


class TrainingPipeline:
    def start_training_pipeline(self) -> ModelTrainerArtifact:
        try:
            logging.info("Training pipeline started")
            data_ingestion_artifact = DataIngestion().initiate_data_ingestion()
            data_transformation_artifact = DataTransformation().initiate_data_transformation(
                data_ingestion_artifact=data_ingestion_artifact
            )
            model_trainer_artifact = ModelTrainer().initiate_model_trainer(
                data_transformation_artifact=data_transformation_artifact
            )
            logging.info("Training pipeline completed")
            return model_trainer_artifact
        except Exception as error:
            raise CustomException(error, sys) from error
