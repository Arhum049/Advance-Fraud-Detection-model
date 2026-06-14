import pandas as pd
import joblib
from sqlalchemy import create_engine, text


# =========================
# LOAD ARTIFACTS
# =========================

feature_columns = joblib.load("feature_columns.pkl")
city_freq = joblib.load("city_freq.pkl")
job_freq = joblib.load("job_freq.pkl")


# =========================
# DATABASE CONNECTION
# =========================

engine = create_engine(
    "mysql+pymysql://root:root@localhost/fraud_analytics",
    pool_pre_ping=True
)


# =========================
# DATABASE LOOKUP
# =========================

def get_customer_stats(customer_id):
    """
    Fetch txn_count and avg_amount from customer_stats table
    """

    query = text("""
        SELECT txn_count, avg_amount
        FROM customer_stats
        WHERE customer_id = :customer_id
    """)

    try:
        with engine.connect() as conn:
            result = conn.execute(
                query,
                {"customer_id": customer_id}
            )

            row = result.fetchone()

            if row:
                return {
                    "txn_count": row.txn_count,
                    "avg_amount": row.avg_amount
                }

    except Exception as e:
        print(f"Database Error: {e}")

    # New customer or DB failure
    return {
        "txn_count": 0,
        "avg_amount": 0
    }


# =========================
# PREPROCESSING
# =========================

def preprocess_transaction(payload):

    # Create all features with default value 0
    features = {
        col: 0
        for col in feature_columns
    }

    # -------------------------
    # Direct Features
    # -------------------------

    features["amt"] = payload["amt"]

    features["gender"] = (
        1 if payload["gender"] == "M"
        else 0
    )

    features["zip"] = payload["zip"]

    features["city_pop"] = payload["city_pop"]

    # -------------------------
    # Frequency Encoding
    # -------------------------

    features["city"] = city_freq.get(
        payload["city"],
        0
    )

    features["job"] = job_freq.get(
        payload["job"],
        0
    )

    # -------------------------
    # Time Features
    # -------------------------

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

    # -------------------------
    # Database Features
    # -------------------------

    customer_stats = get_customer_stats(
        payload["customer_id"]
    )

    features["txn_count"] = (
        customer_stats["txn_count"]
    )

    features["past_avg_amt"] = (
        customer_stats["avg_amount"]
    )

    # -------------------------
    # Category One Hot
    # -------------------------

    category_col = (
        f"category_{payload['category']}"
    )

    if category_col in features:
        features[category_col] = 1

    # -------------------------
    # State One Hot
    # -------------------------

    state_col = (
        f"state_{payload['state']}"
    )

    if state_col in features:
        features[state_col] = 1

    # -------------------------
    # Convert to DataFrame
    # -------------------------

    X = pd.DataFrame(
        [features],
        columns=feature_columns
    )

    return X


# =========================
# TEST
# =========================

payload = {
    "customer_id": 1,
    "amt": 2500,
    "gender": "M",
    "city": "Phoenix",
    "zip": 10001,
    "city_pop": 8000000,
    "job": "Paramedic",
    "category": "shopping_net",
    "state": "CA",
    "dob": "1998-05-20",
    "transaction_time": "2026-06-08T15:30:00"
}

X = preprocess_transaction(payload)

print(X.shape)
print(X.head())
print(X.columns.tolist() == feature_columns)
print(len(feature_columns))