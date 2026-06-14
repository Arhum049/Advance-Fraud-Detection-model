import React from "react";
import "./FeatureSnapshot.css";

function FeatureSnapshotComponent({ featureSnapshot }) {
  const data = featureSnapshot || {
    amt: null,
    dev: null,
    count: null,
    dist: null,
    hour: null,
    fraudCount: null,
  };

  const hasData = featureSnapshot !== null;

  const displayAmt = hasData ? `$${data.amt}` : "—";
  const displayDev = hasData ? `${data.dev}×` : "—";
  const displayCount = hasData ? data.count : "—";
  const displayDist = hasData ? `${data.dist} km` : "—";
  const displayHour = hasData ? `${data.hour}:00` : "—";
  const displayFraudCount = hasData ? data.fraudCount : "—";

  const isDevHighlight = hasData && data.dev > 2;
  const isFraudHighlight = hasData && data.fraudCount > 0;

  return (
    <div className="feat-grid" id="feat-snapshot">
      <div className="feat-chip">
        <div className="feat-chip-label">amount</div>
        <div className="feat-chip-val">{displayAmt}</div>
      </div>
      
      <div className={`feat-chip ${isDevHighlight ? "highlight" : ""}`}>
        <div className="feat-chip-label">amt deviation (7d)</div>
        <div className="feat-chip-val">{displayDev}</div>
      </div>
      
      <div className="feat-chip">
        <div className="feat-chip-label">txn count</div>
        <div className="feat-chip-val">{displayCount}</div>
      </div>
      
      <div className="feat-chip">
        <div className="feat-chip-label">distance (km)</div>
        <div className="feat-chip-val">{displayDist}</div>
      </div>
      
      <div className="feat-chip">
        <div className="feat-chip-label">hour</div>
        <div className="feat-chip-val">{displayHour}</div>
      </div>
      
      <div className={`feat-chip ${isFraudHighlight ? "highlight" : ""}`}>
        <div className="feat-chip-label">past fraud count</div>
        <div className="feat-chip-val">{displayFraudCount}</div>
      </div>
    </div>
  );
}

export const FeatureSnapshot = React.memo(FeatureSnapshotComponent);
