from pathlib import Path


ROOT_DIR = Path(__file__).resolve().parents[2]
ARTIFACTS_DIR = ROOT_DIR / "artifacts"
DATA_DIR = ROOT_DIR / "data"

RAW_TRADE_DATA_PATH = DATA_DIR / "historical_data.csv"
RAW_SENTIMENT_DATA_PATH = DATA_DIR / "fear_greed_index.csv"
