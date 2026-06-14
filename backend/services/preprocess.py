import pandas as pd
import joblib
from services.database import get_customer_stats
from config import FEATURE_COLUMNS_PATH, CITY_FREQ_PATH, JOB_FREQ_PATH

# Load artifacts once at startup
feature_columns = joblib.load(FEATURE_COLUMNS_PATH)
city_freq = joblib.load(CITY_FREQ_PATH)
job_freq = joblib.load(JOB_FREQ_PATH)

def preprocess_transaction(payload) -> pd.DataFrame:
    """
    Transforms raw transaction payload dictionary into a preprocessed pandas DataFrame
    matching the trained model's feature set.
    """
    # Convert Pydantic model to dict if necessary (Pydantic v2)
    if hasattr(payload, "model_dump"):
        payload = payload.model_dump()
    elif hasattr(payload, "dict"):
        payload = payload.dict()

    # Create all features with default value 0
    features = {
        col: 0
        for col in feature_columns
    }

    # Direct Features
    features["amt"] = payload["amt"]
    features["gender"] = (
        1 if payload["gender"] == "M"
        else 0
    )
    features["zip"] = payload["zip"]
    features["city_pop"] = payload["city_pop"]

    # Frequency Encoding
    features["city"] = city_freq.get(
        payload["city"],
        0
    )
    features["job"] = job_freq.get(
        payload["job"],
        0
    )

    # Time Features
    txn_time = pd.to_datetime(
        payload["transaction_time"]
    )
    dob = pd.to_datetime(
        payload["dob"]
    )

    features["unix_time"] = int(
        txn_time.timestamp()
    )
    features["hour"] = txn_time.hour
    features["weekday"] = txn_time.weekday()
    features["age"] = (
        (txn_time - dob).days // 365
    )

    
    
    features["txn_count"] = payload["txn_count"]
  
    features["past_avg_amt"] = payload["avg_amount"]
    

    # Category One Hot
    category_col = (
        f"category_{payload['category']}"
    )
    if category_col in features:
        features[category_col] = 1

    # State One Hot
    state_col = (
        f"state_{payload['state']}"
    )
    if state_col in features:
        features[state_col] = 1

    # Convert to DataFrame
    X = pd.DataFrame(
        [features],
        columns=feature_columns
    )

    return X
