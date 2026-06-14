

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
