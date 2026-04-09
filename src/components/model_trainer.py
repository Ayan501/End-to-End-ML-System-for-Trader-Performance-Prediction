import sys

from sklearn.ensemble import ExtraTreesClassifier, GradientBoostingClassifier, RandomForestClassifier
from sklearn.linear_model import LogisticRegression

from src.entity.artifact_entity import DataTransformationArtifact, ModelTrainerArtifact
from src.entity.config_entity import ModelTrainerConfig
from src.exception import CustomException
from src.logger import logging
from src.utils import evaluate_classification_models, load_object, save_json, save_object


class ModelTrainer:
    def __init__(self, config: ModelTrainerConfig = ModelTrainerConfig()) -> None:
        self.config = config

    def _build_models(self) -> dict:
        return {
            "LogisticRegression": LogisticRegression(**self.config.model_params["LogisticRegression"]),
            "RandomForestClassifier": RandomForestClassifier(
                **self.config.model_params["RandomForestClassifier"]
            ),
            "GradientBoostingClassifier": GradientBoostingClassifier(
                **self.config.model_params["GradientBoostingClassifier"]
            ),
            "ExtraTreesClassifier": ExtraTreesClassifier(
                **self.config.model_params["ExtraTreesClassifier"]
            ),
        }

    def initiate_model_trainer(
        self, data_transformation_artifact: DataTransformationArtifact
    ) -> ModelTrainerArtifact:
        logging.info("Entered the model trainer component")
        try:
            x_train, y_train = load_object(data_transformation_artifact.train_data_path)
            x_test, y_test = load_object(data_transformation_artifact.test_data_path)

            models = self._build_models()
            model_report = evaluate_classification_models(models, x_train, y_train, x_test, y_test)

            best_model_name = max(
                model_report, key=lambda model_name: model_report[model_name]["test_accuracy"]
            )
            best_model_score = model_report[best_model_name]["test_accuracy"]
            best_model = models[best_model_name]

            if best_model_score < self.config.expected_accuracy:
                raise CustomException(
                    Exception(
                        f"No model crossed expected accuracy {self.config.expected_accuracy}. "
                        f"Best score: {best_model_score:.4f}"
                    ),
                    sys,
                )

            save_object(self.config.trained_model_file_path, best_model)
            save_json(
                self.config.metrics_file_path,
                {
                    "best_model_name": best_model_name,
                    "best_model_score": best_model_score,
                    "all_models": model_report,
                },
            )

            logging.info("Best model selected: %s with accuracy %.4f", best_model_name, best_model_score)
            return ModelTrainerArtifact(
                trained_model_file_path=self.config.trained_model_file_path,
                metrics_file_path=self.config.metrics_file_path,
                best_model_name=best_model_name,
                test_accuracy=best_model_score,
            )
        except Exception as error:
            raise CustomException(error, sys) from error
