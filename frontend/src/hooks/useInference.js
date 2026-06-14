import { useState, useCallback } from "react";
import { delay } from "../utils/delay";
import { computeScore } from "../utils/mockFraudEngine";
import { predictTransaction } from "../services/fraudApi";

const INITIAL_STEPS = [
  { title: "1. Validate input", value: "—", status: "idle" },
  { title: "2. Fetch user stats from Redis", value: "—", status: "idle" },
  { title: "3. Build feature vector", value: "—", status: "idle" },
  { title: "4. Model.predict_proba()", value: "—", status: "idle" },
  { title: "5. Apply threshold (0.80)", value: "—", status: "idle" },
  { title: "6. Update user stats (post-predict)", value: "—", status: "idle" }
];

export function useInference({
  userType,
  userData,
  setDbUsers,
  options,
  setTraceSteps,
  setScore,
  setVerdict,
  setFeatureSnapshot,
  setHistory,
  setStats,
}) {
  const [loading, setLoading] = useState(false);

  const runInference = useCallback(async (formData) => {
    if (loading) return;
    setLoading(true);

    const amt = parseFloat(formData.amount) || 100;
    const hour = parseInt(formData.hour) || 12;
    const dist = parseFloat(formData.distance) || 10;
    let age = parseInt(formData.age) || 30;
    const cat = formData.category || "shopping_net";
    const gender = formData.gender || "M";
    const state = formData.state || "AZ";
    const dob = formData.dob || "1990-01-01";
    const city = formData.city || "Phoenix";
    const job = formData.job || "Paramedic";
    const zip = parseInt(formData.zip) || 85001;
    const isNew = userType === "new";
    const user = isNew ? null : userData;

    const activeCity = isNew ? city : (user?.city || city);
    const pop = options?.cities?.find(c => c.city_name === activeCity)?.city_population || 50000;

    // Calculate age from dob for fallback mock score
    const activeDob = isNew ? dob : (user?.dob || dob);
    const dobDate = new Date(activeDob);
    age = new Date().getFullYear() - dobDate.getFullYear();

    // Reset UI to running state
    setVerdict("running");
    setScore(null);
    setFeatureSnapshot(null);
    setTraceSteps(INITIAL_STEPS.map(step => ({ ...step })));

    try {
      // Step 1: Validate input
      await delay(180);
      setTraceSteps(steps => {
        const next = [...steps];
        next[0] = { ...next[0], status: "active" };
        return next;
      });
      await delay(280);
      setTraceSteps(steps => {
        const next = [...steps];
        next[0] = {
          ...next[0],
          status: "done",
          value: `amt=${amt}, hour=${hour}, dist=${dist}, cat=${cat}`
        };
        return next;
      });

      // Step 2: Fetch user stats
      setTraceSteps(steps => {
        const next = [...steps];
        next[1] = { ...next[1], status: "active" };
        return next;
      });
      await delay(380);
      let step2Val = "";
      if (isNew) {
        step2Val = "no record found — applying cold-start defaults";
      } else {
        step2Val = `hit — avg_amt=$${user?.avg_amount}, count=${user?.txn_count}`;
      }
      setTraceSteps(steps => {
        const next = [...steps];
        next[1] = { ...next[1], status: "done", value: step2Val };
        return next;
      });

      // Step 3: Build feature vector
      setTraceSteps(steps => {
        const next = [...steps];
        next[2] = { ...next[2], status: "active" };
        return next;
      });
      await delay(320);
      const avg_amt = isNew ? amt : (user?.avg_amount || amt);
      const dev = (amt / (avg_amt || 1)).toFixed(2);
      const txnCount = isNew ? 0 : (user?.txn_count || 0);
      const fraudCount = 0; // Removed from DB schema
      const mode = isNew ? "[cold-start]" : "[behavioral]";
      const step3Val = `dev=${dev}, count=${txnCount}, fraud_ct=${fraudCount} ${mode}`;
      
      setTraceSteps(steps => {
        const next = [...steps];
        next[2] = { ...next[2], status: "done", value: step3Val };
        return next;
      });

      // Update Feature Snapshot state here
      setFeatureSnapshot({
        amt,
        dev: parseFloat(dev),
        count: txnCount,
        dist,
        hour,
        fraudCount,
      });

      // Step 4: Model Predict (API call / Fallback)
      setTraceSteps(steps => {
        const next = [...steps];
        next[3] = { ...next[3], status: "active" };
        return next;
      });
      await delay(420);

      // Construct payload for actual API call
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const date = String(now.getDate()).padStart(2, "0");
      const hourStr = String(hour).padStart(2, "0");
      const transaction_time = `${year}-${month}-${date}T${hourStr}:00:00`;
      
      const payload = {
        customer_id: isNew ? 9999 : (user?.customer_id || 1),
        amt: amt,
        gender: isNew ? gender : (user?.gender || "M"),
        city: activeCity,
        zip: isNew ? zip : (user?.zip || zip),
        city_pop: pop,
        job: isNew ? job : (user?.job || "Paramedic"),
        category: cat,
        state: isNew ? state : (user?.state || state),
        dob: activeDob,
        transaction_time: transaction_time,
        txn_count: txnCount,
        avg_amount: avg_amt,
      };

      let finalScore;
      try {
        const apiResult = await predictTransaction(payload);
        finalScore = apiResult.fraud_probability;
      } catch (err) {
        console.warn("FastAPI prediction failed, falling back to mock engine:", err.message);
        finalScore = computeScore(amt, hour, dist, age, cat, isNew, user, pop);
      }

      setScore(finalScore);
      setTraceSteps(steps => {
        const next = [...steps];
        next[3] = { ...next[3], status: "done", value: `p(fraud)=${finalScore.toFixed(3)}` };
        return next;
      });

      // Step 5: Apply Threshold
      setTraceSteps(steps => {
        const next = [...steps];
        next[4] = { ...next[4], status: "active" };
        return next;
      });
      await delay(300);
      const isFraud = finalScore >= 0.80;
      const step5Val = `${finalScore.toFixed(3)} ${isFraud ? ">= 0.80 → FRAUD" : "< 0.80 → APPROVE"}`;
      setTraceSteps(steps => {
        const next = [...steps];
        next[4] = { ...next[4], status: "done", value: step5Val };
        return next;
      });

      // Update Verdict
      setVerdict(isFraud ? "fraud" : "safe");

      // Step 6: Update user stats
      setTraceSteps(steps => {
        const next = [...steps];
        next[5] = { ...next[5], status: "active" };
        return next;
      });
      await delay(250);
      setTraceSteps(steps => {
        const next = [...steps];
        next[5] = {
          ...next[5],
          status: "done",
          value: "user stats updated in Redis (post-predict, no leakage)"
        };
        return next;
      });

      // Update stats and history
      setStats(prev => {
        const total = prev.total + 1;
        const fraud = isFraud ? prev.fraud + 1 : prev.fraud;
        const safe = !isFraud ? prev.safe + 1 : prev.safe;
        return { total, fraud, safe };
      });

      // Update local dbUsers
      if (!isNew && user && setDbUsers) {
        setDbUsers(prev => prev.map(u => {
          if (u.customer_id === user.customer_id) {
            const newCount = u.txn_count + 1;
            const newAvg = ((u.avg_amount * u.txn_count) + amt) / newCount;
            return { ...u, txn_count: newCount, avg_amount: Number(newAvg.toFixed(2)) };
          }
          return u;
        }));
      }

      const userLabel = isNew ? "New user" : (user ? user.name : "");
      setHistory(prev => {
        const newHistory = [
          { amt, cat, score: finalScore, isFraud, userLabel, isNew },
          ...prev
        ];
        if (newHistory.length > 5) newHistory.pop();
        return newHistory;
      });

    } catch (error) {
      console.error("Inference execution error:", error);
      setVerdict("idle");
    } finally {
      setLoading(false);
    }
  }, [userType, userData, loading, setTraceSteps, setScore, setVerdict, setFeatureSnapshot, setHistory, setStats]);

  return { runInference, loading };
}
