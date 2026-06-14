import React, { useState, useMemo, useEffect } from "react";
import "./App.css";

// Constants & Hook
import { useInference } from "./hooks/useInference";
import { getUsers, getStatesCategories, getCitiesJobs } from "./services/fraudApi";

// Components
import { Header } from "./components/Header/Header";
import { UserProfile } from "./components/UserProfile/UserProfile";
import { TransactionForm } from "./components/TransactionForm/TransactionForm";
import { InferenceTrace } from "./components/InferenceTrace/InferenceTrace";
import { VerdictCard } from "./components/VerdictCard/VerdictCard";
import { ScoreBar } from "./components/ScoreBar/ScoreBar";
import { TransactionHistory } from "./components/TransactionHistory/TransactionHistory";

function App() {
  // Required Application States
  const [userType, setUserType] = useState("new");
  const [selectedUser, setSelectedUser] = useState("u001");
  const [formData, setFormData] = useState({
    amount: 240,
    hour: 14,
    category: "shopping_net",
    distance: 12,
    cityPop: 85000,
    age: 34,
    gender: "M",
    state: "AZ",
    city: "Phoenix",
    dob: "1990-01-01",
    job: "Paramedic",
    zip: 85001,
  });
  const [options, setOptions] = useState({ categories: [], states: [], cities: [], jobs: [] });
  const [traceSteps, setTraceSteps] = useState([]);
  const [score, setScore] = useState(null);
  const [verdict, setVerdict] = useState("idle");
  const [featureSnapshot, setFeatureSnapshot] = useState(null);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    fraud: 0,
    safe: 0,
  });

  const [dbUsers, setDbUsers] = useState([]);

  // Fetch options on mount
  useEffect(() => {
    Promise.all([getStatesCategories(), getCitiesJobs()])
      .then(([statesCats, citiesJobs]) => {
        setOptions({
          categories: statesCats.categories,
          states: statesCats.states,
          cities: citiesJobs.cities,
          jobs: citiesJobs.jobs,
        });
      })
      .catch((err) => console.error("Failed to fetch options:", err));
  }, []);

  // Fetch users when switching to "existing" mode
  useEffect(() => {
    if (userType === "existing" && dbUsers.length === 0) {
      getUsers()
        .then((data) => setDbUsers(data))
        .catch((err) => console.error("Failed to fetch users:", err));
    }
  }, [userType, dbUsers.length]);

  // Derived user details using useMemo
  const userData = useMemo(() => {
    if (userType !== "existing") return null;
    return dbUsers.find(
      (u) => `u${String(u.customer_id).padStart(3, "0")}` === selectedUser
    ) || null;
  }, [userType, selectedUser, dbUsers]);

  // Inference hook orchestration
  const { runInference, loading } = useInference({
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
  });

  return (
    <div className="app-wrapper">
      {/* Screen Reader Only Header for Accessibility */}
      <h2 className="sr-only">
        Fraud detection system demo — submit a transaction to see real-time
        scoring for new or existing users
      </h2>

      {/* Main Visible Header */}
      <Header stats={stats} />

      <div className="app">
        {/* Left Hand Control Panel */}
        <div className="left-panel">
          <UserProfile
            userType={userType}
            selectedUser={selectedUser}
            setUserType={setUserType}
            setSelectedUser={setSelectedUser}
            userData={userData}
            dbUsers={dbUsers}
          />
          <TransactionForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={runInference}
            loading={loading}
            isNew={userType === "new"}
            options={options}
          />
        </div>

        {/* Right Hand Output Panel */}
        <div className="right-panel">
          <div className="panel">
            <div className="panel-title">Inference trace</div>
            <InferenceTrace traceSteps={traceSteps} />
            <VerdictCard
              verdict={verdict}
              score={score}
              featureSnapshot={featureSnapshot}
            />
            <ScoreBar score={score} threshold={0.21} />
          </div>

          <div className="panel" style={{ marginTop: "12px" }}>
            <TransactionHistory history={history} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
