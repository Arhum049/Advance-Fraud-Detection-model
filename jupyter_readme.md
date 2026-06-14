# Credit Card Fraud Detection

> Identifying fraudulent transactions from 280,000+ real-world card transactions using machine learning — achieving **90.3% Precision**, **91.1% Recall**, and **~0.999 ROC-AUC**.

---

## The Problem

Fraud is rare. In a typical transaction dataset, fewer than 1% of transactions are fraudulent. A model that blindly predicts *"not fraud"* on everything would be 99% accurate — and completely useless.

The challenge is building a system that correctly catches the rare fraud cases **without** raising too many false alarms on legitimate transactions. This project tackles that through systematic feature engineering, 9 experiments across different imbalance-handling techniques, and threshold optimisation.

---

## Results at a Glance

| Metric | Score |
|---|---|
| Precision | **90.3%** |
| Recall | **91.1%** |
| F1 Score | **90.7%** |
| ROC-AUC | **~0.999** |
| Frauds caught (test set) | **406 out of 429** |
| False positives | ~117 |
| Final algorithm | XGBoost |
| Decision threshold | 0.8 |

---

## Tech Stack

- **Python**, **Pandas**, **NumPy**
- **Scikit-learn** — Random Forest, VarianceThreshold, train-test split, metrics
- **XGBoost** — final model
- **imbalanced-learn** — SMOTE
- **Geopy** — geodesic distance calculation
- **Joblib** — model serialisation

---

## Feature Engineering

The dataset contains raw transaction records. Before any modelling, the following features were constructed — all designed to avoid data leakage:

| Feature | Description | Leakage-safe? |
|---|---|---|
| `hour` | Hour of the transaction | ✅ |
| `weekday` | Day of the week | ✅ |
| `age` | Customer age at transaction time | ✅ |
| `distance` | Geodesic distance (km) between customer and merchant | ✅ |
| `txn_count` | Running count of customer's prior transactions (`cumcount`) | ✅ |
| `past_avg_amt` | Customer's historical average spend — using `shift(1)` to exclude current transaction | ✅ |
| `amt_deviation` | Current amount ÷ historical average | ✅ |
| `time_since_last_txn` | Seconds since customer's previous transaction | ✅ |
| `merchant_count` | Running count of prior appearances by this merchant | ✅ |
| `city`, `job` | Frequency-encoded (avoids high-cardinality column explosion) | ✅ |
| `category`, `state` | One-hot encoded | ✅ |
| `gender` | Binary encoded (M=1, F=0) | ✅ |

**Key design choices:**
- Dataset sorted by `unix_time` before any customer-history features are created — no future data bleeds into past-looking features
- `shift(1)` on rolling averages ensures the current transaction is never included in its own historical baseline
- SMOTE applied to training data only — test set reflects real-world class distribution

---

## Experiments

Nine experiments were run, all using the same 80/20 stratified train-test split:

| # | Experiment | Technique |
|---|---|---|
| 1 | Baseline | Random Forest, no imbalance handling |
| 2 | Class Weighting | `class_weight='balanced'` |
| 3 | SMOTE | Synthetic oversampling of minority class |
| 4 | Variance Threshold | Remove low-variance features (`threshold=0.01`) |
| 5 | SMOTE + Variance | Combined oversampling and feature pruning |
| 6 | Balanced Subsample | Per-tree class weights in Random Forest |
| 7 | Custom Weight 1:5 | Manual `class_weight={0:1, 1:5}` |
| 8 | Custom Weight 1:10 | More aggressive `class_weight={0:1, 1:10}` |
| 9 | **XGBoost** | Sequential boosting with `scale_pos_weight` |

XGBoost achieved the highest F1 Score across all experiments. The key takeaway: **algorithm choice had more impact than imbalance strategy**.

---

## Threshold Optimisation

The default classification threshold of 0.5 was not used. Multiple thresholds were evaluated on the XGBoost model's probability outputs:

| Threshold | Precision | Recall | F1 |
|---|---|---|---|
| 0.1 | Low | Very High | Moderate |
| 0.3 | Moderate | High | Moderate-High |
| 0.5 (default) | Moderate-High | Moderate | Moderate |
| **0.8 (selected)** | **90.9%** | **90.7%** | **90.8%** |

A threshold of **0.8** was selected — the model only flags a transaction as fraud when it's at least 80% confident. This produces the strongest balance between catching fraud and keeping false alarms low.

---

## Feature Importance

After training XGBoost, feature importances were inspected. The most influential features:

1. `amt` — transaction amount (strongest single predictor)
2. Transaction category columns
3. `hour` / `unix_time` — timing of the transaction
4. `past_avg_amt` — customer's historical baseline

Four engineered features contributed very little: `distance`, `merchant_count`, `amt_deviation`, and `time_since_last_txn`. The model was retrained **without** them:

> Precision: 90.3% | Recall: 91.1% | F1: 90.7% | ROC-AUC: ~0.999

Performance was identical. The simpler model was kept — fewer features means faster inference and less overfitting risk.

---

## Project Structure

```
├── experiments.ipynb          # Full experiment notebook
├── fraud_detection_xgboost.pkl  # Saved final model
├── feature_columns.pkl        # Feature column list for inference
└── fraudTest.csv              # Dataset (not included — see below)
```

---

## Dataset

This project uses the **fraudTest.csv** dataset — a publicly available simulated credit card transaction dataset commonly used for fraud detection research. It can be found on [Kaggle](https://www.kaggle.com/datasets/kartik2112/fraud-detection).

---

## How to Run

```bash
# Install dependencies
pip install pandas numpy scikit-learn xgboost imbalanced-learn geopy joblib

# Open the notebook
jupyter notebook experiments.ipynb
```

Run all cells in order. The notebook is structured so each section is self-contained and builds on the previous one.

---

## Backend API (FastAPI)

The project includes a production-ready FastAPI backend that serves the XGBoost model in real time. It handles preprocessing, inference, and stateful customer history — all the things needed to run the model against live transactions, not just a static test set.

### Architecture

```
app.py                        # FastAPI entrypoint, route definitions
services/
├── preprocess.py             # Feature engineering pipeline (mirrors the notebook)
└── database.py               # SQLAlchemy queries and customer stat updates
fraud_detection_xgboost.pkl   # Trained XGBoost model
feature_columns.pkl           # Ordered feature list for inference alignment
city_freq.pkl                 # Frequency encoding dictionary for city
job_freq.pkl                  # Frequency encoding dictionary for job
```

---

### Database Schema (MySQL)

The database stores lookup data for the frontend and maintains stateful transaction history per customer — critical for the model's temporal features like `past_avg_amt` and `txn_count`.

| Table | Purpose | Key Columns |
|---|---|---|
| `customer_stats` | Core user profiles with rolling transaction history | `customer_id`, `customer_name`, `gender`, `dob`, `job`, `txn_count`, `avg_amount` |
| `city` | Geographic lookup | `city_name`, `city_population` |
| `job` | Occupation lookup | `job_name` |
| `category` | Transaction category lookup | `category_name` (e.g. `grocery_pos`, `shopping_net`) |
| `state` | US state lookup | `state_name` |

`txn_count` and `avg_amount` in `customer_stats` are updated after every processed transaction, keeping the model's historical features current.

---

### API Endpoints

#### `POST /predict` — Core inference endpoint

Takes a raw transaction payload, runs the full preprocessing pipeline, and returns a fraud prediction.

**Request body:**
```json
{
  "customer_id": "C123",
  "amt": 450.00,
  "hour": 2,
  "weekday": 4,
  "category": "shopping_net",
  "state": "CA",
  "city": "Los Angeles",
  "merchant_lat": 34.05,
  "merchant_long": -118.24
}
```

**Response:**
```json
{
  "prediction": 1,
  "probability": 0.94,
  "features_used": { ... }
}
```

**What happens internally:**
1. Fetches the customer's `txn_count` and `avg_amount` from `customer_stats`
2. Passes raw payload + customer history to `preprocess_transaction()`
3. Runs the engineered feature vector through XGBoost
4. Applies the 0.8 decision threshold
5. Asynchronously updates `customer_stats` — increments `txn_count` and recalculates `avg_amount`

---

#### `GET /get-users`
Returns all customer profiles from `customer_stats` to populate the frontend user selection panel.

#### `GET /get-states-categories`
Returns all US states and merchant categories for frontend form dropdowns.

#### `GET /get-cities-jobs`
Returns all cities (with population) and occupations for frontend form dropdowns.

---

### Core Services

#### `services/preprocess.py` — `preprocess_transaction(payload)`

Mirrors the feature engineering from the notebook, adapted for single-transaction real-time inference:

- Derives `age` from `dob` relative to transaction time
- Calculates geodesic `distance` between customer coordinates and merchant coordinates
- Computes `amt_deviation` as `amt / avg_amount` using the customer's live historical average
- Applies **frequency encoding** to `city` and `job` using saved `.pkl` dictionaries (`city_freq.pkl`, `job_freq.pkl`)
- Applies **one-hot encoding** to `state` and `category`, then reindexes against `feature_columns.pkl` — filling any missing columns with `0` to guarantee the feature vector matches the model's exact input schema

#### `services/database.py`

| Function | What it does |
|---|---|
| `get_customer_stats(customer_id)` | Fetches `txn_count` and `avg_amount` for a customer before inference |
| `update_customer_stats(customer_id, amt)` | SQL `UPDATE` — recalculates rolling average and increments transaction count post-inference |
| `get_users()` | Returns all customer profiles as a list of dicts |
| `get_states_and_category()` | Returns state and category lookup data |
| `get_cities_and_jobs()` | Returns city (with population) and job lookup data |

---

## Key Lessons

- **Class imbalance must be handled** — the baseline model's recall was poor despite high accuracy
- **XGBoost's sequential learning outperformed all Random Forest variants** on this dataset
- **Threshold tuning is not optional** — moving from 0.5 to 0.8 significantly improved real-world usability
- **Simpler models generalise better** — removing 4 low-importance features maintained full performance
- **Leakage prevention is non-negotiable** — every temporal feature was designed so it only uses information available at prediction time