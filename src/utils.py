import json
import pickle
import sys
from pathlib import Path

from sklearn.metrics import accuracy_score, f1_score

from src.exception import CustomException


def ensure_parent_dir(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)


def save_object(file_path: Path, obj: object) -> None:
    try:
        ensure_parent_dir(file_path)
        with open(file_path, "wb") as file_obj:
            pickle.dump(obj, file_obj)
    except Exception as error:
        raise CustomException(error, sys) from error


def load_object(file_path: Path) -> object:
    try:
        with open(file_path, "rb") as file_obj:
            return pickle.load(file_obj)
    except Exception as error:
        raise CustomException(error, sys) from error


def save_json(file_path: Path, payload: dict) -> None:
    try:
        ensure_parent_dir(file_path)
        with open(file_path, "w", encoding="utf-8") as file_obj:
            json.dump(payload, file_obj, indent=4)
    except Exception as error:
        raise CustomException(error, sys) from error


def evaluate_classification_models(models: dict, x_train, y_train, x_test, y_test) -> dict:
    try:
        report = {}
        for model_name, model in models.items():
            model.fit(x_train, y_train)
            train_pred = model.predict(x_train)
            test_pred = model.predict(x_test)
            report[model_name] = {
                "train_accuracy": float(accuracy_score(y_train, train_pred)),
                "test_accuracy": float(accuracy_score(y_test, test_pred)),
                "test_weighted_f1": float(f1_score(y_test, test_pred, average="weighted")),
            }
        return report
    except Exception as error:
        raise CustomException(error, sys) from error

