import React from "react";
import "./ScoreBar.css";

function ScoreBarComponent({ score, threshold = 0.21 }) {
  const hasScore = typeof score === "number" && score !== null;
  const opacity = hasScore ? 1 : 0.3;
  
  const percent = hasScore ? (score * 100).toFixed(1) : 0;
  const scoreLabel = hasScore ? `${percent}%` : "—";
  
  const isFraud = hasScore && score >= threshold;
  const fillColor = isFraud ? "#E24B4A" : "#1D9E75";

  return (
    <div className="score-bar-wrap" style={{ opacity }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        fontSize: "11px",
        color: "var(--color-text-secondary)",
        marginBottom: "4px"
      }}>
        <span>Fraud probability</span>
        <span>{scoreLabel}</span>
      </div>
      
      <div className="score-bar-bg">
        <div
          className="score-bar-fill"
          style={{
            width: `${percent}%`,
            backgroundColor: fillColor
          }}
        ></div>
        <div
          className="threshold-marker"
          style={{ left: `${threshold * 100}%` }}
        ></div>
      </div>
      
      <div className="score-bar-labels">
        <span>0</span>
        <span style={{ marginLeft: "15%" }}>threshold {threshold}</span>
        <span>1.0</span>
      </div>
    </div>
  );
}

export const ScoreBar = React.memo(ScoreBarComponent);
