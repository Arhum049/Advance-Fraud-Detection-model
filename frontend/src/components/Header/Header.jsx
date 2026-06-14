import React from "react";
import "./Header.css";

function HeaderComponent({ stats }) {
  const { total = 0, fraud = 0, safe = 0 } = stats || {};

  return (
    <div className="header-container">
      <div>
        <h1 className="header-title">Fraud detection — live demo</h1>
        <div className="header-subtitle">
          Submit a transaction to see the full inference trace
        </div>
      </div>
    </div>
  );
}

export const Header = React.memo(HeaderComponent);
