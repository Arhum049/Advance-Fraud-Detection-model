import React from "react";
import "./InferenceTrace.css";

function InferenceTraceComponent({ traceSteps }) {
  // Use a fallback in case traceSteps is empty/undefined initially
  const steps = traceSteps && traceSteps.length > 0 ? traceSteps : [
    { title: "1. Validate input", value: "—", status: "idle" },
    { title: "2. Fetch user stats from Redis", value: "—", status: "idle" },
    { title: "3. Build feature vector", value: "—", status: "idle" },
    { title: "4. Model.predict_proba()", value: "—", status: "idle" },
    { title: "5. Apply threshold (0.80)", value: "—", status: "idle" },
    { title: "6. Update user stats (post-predict)", value: "—", status: "idle" }
  ];

  return (
    <div className="trace">
      {steps.map((step, index) => (
        <div key={index} className={`trace-step ${step.status}`}>
          <div className="tdot"></div>
          <div className="tstep-title">{step.title}</div>
          <div className="tstep-val">{step.value}</div>
        </div>
      ))}
    </div>
  );
}

export const InferenceTrace = React.memo(InferenceTraceComponent);
