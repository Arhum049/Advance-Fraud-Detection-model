import json
import joblib
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from services.preprocess import preprocess_transaction
from services.database import get_users, get_states_and_category, update_customer_stats, get_cities_and_jobs

from config import XGBOOST_MODEL_PATH, ALLOWED_ORIGINS
 
# Load model at startup
model = joblib.load(XGBOOST_MODEL_PATH)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Payload(BaseModel):
    customer_id: int
    amt: float
    gender: str
    city: str
    zip: int
    city_pop: int
    job: str
    category: str
    state: str
    dob: str
    transaction_time: str
    txn_count: int
    avg_amount: float



@app.post("/predict")
async def root(base: Payload):
    # Preprocess the payload into a Pandas DataFrame
    X = preprocess_transaction(base)
    
    # Get fraud probability (class 1)
    fraud_probability = float(model.predict_proba(X)[0][1])
    prediction = int(fraud_probability >= 0.80)
    
    # Convert DataFrame to native Python dict (removes numpy types like numpy.int64)
    features_dict = json.loads(X.to_json(orient="records"))[0]
    
    # Update DB if existing user
    if base.customer_id != 9999:
        update_customer_stats(base.customer_id, base.amt)
    
    return {
        "prediction": prediction,
        "fraud_probability": fraud_probability,
        
    }

@app.get("/get-users")
async def fetch_users():
    try:
        result = get_users()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database connection error: {str(e)}")

@app.get("/get-states-categories")
async def fetch_states_categories():
    try:
        result = get_states_and_category()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database connection error: {str(e)}")

@app.get("/get-cities-jobs")
async def fetch_cities_jobs():
    try:
        result = get_cities_and_jobs()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database connection error: {str(e)}")