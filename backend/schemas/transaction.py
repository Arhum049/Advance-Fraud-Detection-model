from pydantic import BaseModel, Field
from typing import Dict, Any

class TransactionPayload(BaseModel):
    customer_id: int = Field(..., example=1)
    amt: float = Field(..., example=2500.0)
    gender: str = Field(..., example="M", description="Gender: 'M' or 'F'")
    city: str = Field(..., example="Phoenix")
    zip: int = Field(..., example=10001)
    city_pop: int = Field(..., example=8000000)
    job: str = Field(..., example="Paramedic")
    category: str = Field(..., example="shopping_net")
    state: str = Field(..., example="CA")
    dob: str = Field(..., example="1998-05-20", description="Date of birth in YYYY-MM-DD format")
    transaction_time: str = Field(..., example="2026-06-08T15:30:00", description="Transaction time in YYYY-MM-DDTHH:MM:SS format")
    txn_count: int = Field(default=0, example=12, description="Historical transaction count for the customer")
    avg_amount: float = Field(default=0.0, example=150.0, description="Historical average transaction amount for the customer")

class PredictionResponse(BaseModel):
    is_fraud: int = Field(..., description="1 if the transaction is predicted to be fraudulent, 0 otherwise")
    fraud_probability: float = Field(..., description="The probability that the transaction is fraudulent")
    details: Dict[str, Any] = Field(..., description="Additional metadata about the processed transaction")
