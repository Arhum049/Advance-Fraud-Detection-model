import React from "react";
import "./TransactionHistory.css";

function TransactionHistoryComponent({ history }) {
  if (!history || history.length === 0) {
    return (
      <div className="history-list">
        <div className="history-empty">
          Transaction history will appear here
        </div>
      </div>
    );
  }

  return (
    <div className="history-list" id="history-list">
      {history.map((tx, idx) => (
        <div key={idx} className="history-row">
          <span className={`hbadge ${tx.isFraud ? "f" : "s"}`}>
            {tx.isFraud ? "fraud" : "ok"}
          </span>
          <span style={{ flex: 1, color: "var(--color-text-primary)" }}>
            ${tx.amt} · {tx.cat}
          </span>
          <span style={{ color: "var(--color-text-secondary)", fontSize: "11px" }}>
            {tx.userLabel}
          </span>
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            color: "var(--color-text-secondary)",
            marginLeft: "8px"
          }}>
            {typeof tx.score === "number" ? tx.score.toFixed(3) : "—"}
          </span>
        </div>
      ))}
    </div>
  );
}

export const TransactionHistory = React.memo(TransactionHistoryComponent);
