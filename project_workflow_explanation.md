# Advanced Fraud Detection System: Workflow and Project Explanation

This document outlines the detailed workflow and architectural design of the Advanced Fraud Detection System, analyzing how the APIs interact between the frontend and backend, and explaining the unique value proposition of the system.

## 1. System Overview

The system is designed to detect fraudulent transactions in real-time using an XGBoost machine learning model. What sets this system apart from ordinary fraud detection implementations is its **hybrid prediction capability**—it supports both **Global (Cold Start)** and **User-Level (Behavioral)** predictions. 

By maintaining a database of existing users and their transaction history, the system can tailor its predictions to individual user patterns (e.g., historical average transaction amounts and transaction frequency), making it highly accurate for returning customers.

---

## 2. API Workflow Details

The system relies on a FastAPI backend (`app.py`) and a React frontend (`App.jsx`, `fraudApi.js`). The workflow is broken down into three main phases:

### Phase 1: Application Initialization (Default Data Loading)
When the application first loads, the frontend needs to populate the transaction form with realistic options.
*   **APIs Called**:
    *   `GET /get-states-categories`
    *   `GET /get-cities-jobs`
*   **Workflow**: The frontend fires these two requests in parallel when the `App` component mounts. The backend retrieves unique states, transaction categories, cities, and job titles from the database. This ensures the UI is dynamic and data-driven.

### Phase 2: User Context Selection
The system allows testing transactions against a "New User" or an "Existing User".
*   **API Called**: 
    *   `GET /get-users` (Triggered only when "Existing User" is selected)
*   **Workflow**: 
    *   If the user toggles to **Existing user**, the frontend fetches the list of customers from the database.
    *   This API returns historical data for each user, including `avg_amount`, `txn_count`, `dob`, and `customer_id`.
    *   The frontend uses this historical data to pre-fill the transaction payload, enabling the ML model to compare the new transaction against the user's established behavioral profile.
    *   If **New user** is selected, a dummy `customer_id` (e.g., `9999`) is used, and the model relies purely on global features (cold-start prediction).

### Phase 3: Inference and Transaction Submission
When the user submits a transaction for scoring, the core fraud detection logic is triggered.
*   **API Called**: 
    *   `POST /predict`
*   **Workflow**:
    1.  **Payload Construction**: The frontend bundles the form data (amount, category, location, time) and the user's historical data (if existing) into a JSON payload.
    2.  **Preprocessing**: The backend receives the payload and passes it to `preprocess_transaction()`. This converts the raw data into a structured Pandas DataFrame, applying necessary encodings and scaling to match the XGBoost model's training format.
    3.  **Model Prediction**: The preprocessed data is fed into the loaded `joblib` XGBoost model. The model outputs a `fraud_probability` (from 0.0 to 1.0).
    4.  **Verdict Thresholding**: The backend applies a strict threshold (probability $\ge$ 0.80) to classify the transaction as fraudulent (1) or safe (0).
    5.  **Database Update (Continuous Learning Loop)**: **Crucially**, if the transaction belongs to an existing user (`customer_id != 9999`), the backend calls `update_customer_stats()` to update the database. It recalculates the user's `avg_amount` and increments their `txn_count`. This means the user's baseline profile evolves with every transaction, making future predictions even more accurate.
    6.  **Response**: The backend returns the final `prediction` and `fraud_probability` to the frontend, which visually renders the inference trace and score.

---

## 3. What Sets This System Apart?

Most ordinary fraud detection systems rely entirely on static, global rules (e.g., "Is the amount > $10,000?") or global ML models that treat every user the same. 

This project distinguishes itself through **User-Level Contextual Prediction**:
1.  **Behavioral Baselines**: By feeding `avg_amount` and `txn_count` into the model, a $500 transaction might be flagged as fraud for a user whose historical average is $15, but approved instantly for a user whose average is $800.
2.  **Feedback Loop**: The `update_customer_stats` mechanism ensures that user profiles are not static. The system "learns" a user's changing financial habits over time.
3.  **Cold-Start Fallback**: The system gracefully handles brand-new users without breaking, falling back to global heuristics and location-based data (city population, distance) until enough transaction history is built up.
