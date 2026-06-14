const BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

/**
 * Calls the Python FastAPI backend to get a fraud prediction.
 * Falls back if the API returns an error or is unreachable.
 * 
 * @param {Object} payload - The transaction payload matching TransactionPayload schema
 * @returns {Promise<{prediction: number, fraud_probability: number, features: Object}>}
 */
export async function predictTransaction(payload) {
  const response = await fetch(`${BASE_URL}/predict`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API response error ${response.status}: ${errorText}`);
  }

  const data = await response.json();

  // Normalize response schema to support both the backend Pydantic model
  // (is_fraud, details) and the frontend expectation (prediction, features)
  const prediction = typeof data.prediction !== 'undefined' ? data.prediction : data.is_fraud;
  const features = data.features || data.details || {};
  const fraud_probability = typeof data.fraud_probability !== 'undefined' ? data.fraud_probability : 0.0;

  return {
    prediction,
    fraud_probability,
    features,
  };
}

export async function getUsers() {
  const response = await fetch(`${BASE_URL}/get-users`);
  if (!response.ok) {
    throw new Error(`API error fetching users: ${response.status}`);
  }
  return await response.json();
}

export async function getStatesCategories() {
  const response = await fetch(`${BASE_URL}/get-states-categories`);
  if (!response.ok) {
    throw new Error(`API error fetching states and categories: ${response.status}`);
  }
  return await response.json();
}

export async function getCitiesJobs() {
  const response = await fetch(`${BASE_URL}/get-cities-jobs`);
  if (!response.ok) {
    throw new Error(`API error fetching cities and jobs: ${response.status}`);
  }
  return await response.json();
}
