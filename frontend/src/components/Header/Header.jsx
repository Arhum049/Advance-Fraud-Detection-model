import React, { useState } from "react";
import "./Header.css";

function HeaderComponent({ stats }) {
  const { total = 0, fraud = 0, safe = 0 } = stats || {};
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="header-container">
      <div>
        <h1 className="header-title">Fraud detection — live demo</h1>
        <div className="header-subtitle">
          Submit a transaction to see the full inference trace
        </div>
        <button className="info-button" onClick={() => setShowModal(true)}>
          Tap to know how it works
        </button>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            <h2 className="modal-title">How it works</h2>
            <div className="modal-body">
              <p>
                This system detects fraudulent transactions in real-time using an XGBoost machine learning model. It supports both <strong>Global (Cold Start)</strong> and <strong>User-Level (Behavioral)</strong> predictions.
              </p>
              
              <h3>1. Application Initialization</h3>
              <p>
                When the application loads, it fetches data from the backend to populate the transaction form with realistic options (states, categories, cities, jobs).
              </p>

              <h3>2. User Context Selection</h3>
              <ul>
                <li><strong>Existing user:</strong> Fetches historical data (like <code>avg_amount</code> and <code>txn_count</code>) to build a behavioral profile.</li>
                <li><strong>New user:</strong> Relies purely on global features for a cold-start prediction.</li>
              </ul>

              <h3>3. Inference & Feedback Loop</h3>
              <ul>
                <li>The transaction payload is sent to the backend and processed into a Pandas DataFrame.</li>
                <li>The XGBoost model outputs a fraud probability. A threshold of ≥ 0.80 classifies it as fraud.</li>
                <li><strong>Continuous Learning:</strong> If the transaction is for an existing user, the database is updated (recalculating their <code>avg_amount</code> and <code>txn_count</code>). This feedback loop ensures the profile evolves with every transaction.</li>
              </ul>

              <h3>What Sets This System Apart?</h3>
              <p>
                Unlike ordinary systems that rely solely on global rules, this project uses <strong>User-Level Contextual Prediction</strong>. A $500 transaction might be flagged as fraud for a user whose historical average is $15, but approved for a user whose average is $800. The system learns a user's financial habits over time while gracefully handling brand-new users.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export const Header = React.memo(HeaderComponent);
