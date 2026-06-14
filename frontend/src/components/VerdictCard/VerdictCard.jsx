import React from "react";
import "./VerdictCard.css";

function VerdictCardComponent({ verdict, score, featureSnapshot }) {
  if (verdict === "running") {
    return (
      <div className="verdict running">
        <div className="verdict-label">
          <span className="spinner"></span> Running...
        </div>
        <div className="verdict-sub">Processing transaction</div>
      </div>
    );
  }

  if (verdict === "safe") {
    const formattedScore = typeof score === "number" ? score.toFixed(3) : "—";
    return (
      <div className="verdict safe">
        <div className="verdict-label">Transaction approved</div>
        <div className="verdict-sub">
          Score {formattedScore} — below threshold, all signals normal
        </div>
      </div>
    );
  }

  if (verdict === "fraud") {
    const formattedScore = typeof score === "number" ? score.toFixed(3) : "—";
    
    // Determine risk reason identical to HTML calculation logic
    const devNum = featureSnapshot ? parseFloat(featureSnapshot.dev) : 0;
    const dist = featureSnapshot ? featureSnapshot.dist : 0;
    const fraudCount = featureSnapshot ? featureSnapshot.fraudCount : 0;
    const hour = featureSnapshot ? featureSnapshot.hour : 0;

    const reason =
      devNum > 2
        ? "Unusually high amount deviation"
        : dist > 300
        ? "Suspicious merchant distance"
        : fraudCount > 0
        ? "User has prior fraud flags"
        : hour < 6
        ? "Off-hours transaction"
        : "Multiple risk signals";

    return (
      <div className="verdict fraud">
        <div className="verdict-label">Fraud flagged</div>
        <div className="verdict-sub">
          Score {formattedScore} — {reason}
        </div>
      </div>
    );
  }

  // Default / Idle state
  return (
    <div className="verdict idle">
      <div className="verdict-label">Awaiting transaction</div>
      <div className="verdict-sub">
        Submit a transaction to see the fraud decision
      </div>
    </div>
  );
}

export const VerdictCard = React.memo(VerdictCardComponent);
