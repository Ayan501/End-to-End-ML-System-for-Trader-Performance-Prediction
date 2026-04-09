from src.pipeline.training_pipeline import TrainingPipeline


if __name__ == "__main__":
    artifact = TrainingPipeline().start_training_pipeline()
    print(
        f"Training completed. Best model: {artifact.best_model_name}, "
        f"test accuracy: {artifact.test_accuracy:.4f}"
    )
