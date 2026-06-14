import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "models")

from dotenv import load_dotenv

env_path = os.path.join(BASE_DIR, ".env")
load_dotenv(dotenv_path=env_path)

DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "mysql+pymysql://root:root@localhost/fraud_analytics"
)

# Parse allowed origins into a list
_origins = os.environ.get("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
ALLOWED_ORIGINS = [origin.strip() for origin in _origins.split(",") if origin.strip()]

HOST = os.environ.get("HOST", "127.0.0.1")
PORT = int(os.environ.get("PORT", "8000"))

FEATURE_COLUMNS_PATH = os.path.join(MODEL_DIR, "feature_columns.pkl")
CITY_FREQ_PATH = os.path.join(MODEL_DIR, "city_freq.pkl")
JOB_FREQ_PATH = os.path.join(MODEL_DIR, "job_freq.pkl")
XGBOOST_MODEL_PATH = os.path.join(MODEL_DIR, "fraud_detection_xgboost.pkl")
