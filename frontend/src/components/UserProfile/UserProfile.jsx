import React, { useState, useEffect } from "react";
import "./UserProfile.css";
import { getUsers } from "../../services/fraudApi";

function UserProfileComponent({
  userType,
  selectedUser,
  setUserType,
  setSelectedUser,
  userData,
  dbUsers
}) {
  const handleToggle = (type) => {
    setUserType(type);
  };

  const handleUserChange = (e) => {
    setSelectedUser(e.target.value);
  };

  const isExisting = userType === "existing";
  const isNew = userType === "new";

  return (
    <div className="panel">
      <div className="panel-title">User profile</div>
      
      <div className="user-toggle">
        <button
          className={`utab ${isNew ? "on" : ""}`}
          onClick={() => handleToggle("new")}
          type="button"
        >
          New user (cold start)
        </button>
        <button
          className={`utab ${isExisting ? "on" : ""}`}
          onClick={() => handleToggle("existing")}
          type="button"
        >
          Existing user
        </button>
      </div>

      <div className={`existing-fields ${isExisting ? "" : "hidden"}`}>
        <div className="field">
          <label htmlFor="user-select">User ID</label>
          <select
            id="user-select"
            value={selectedUser}
            onChange={handleUserChange}
          >
            {dbUsers.length > 0 ? (
              dbUsers.map((u) => {
                const userKey = `u${String(u.customer_id).padStart(3, '0')}`;
                return (
                  <option key={userKey} value={userKey}>
                    {u.customer_name}
                  </option>
                );
              })
            ) : (
              <>
                <option value="u001">Alice Chen</option>
                <option value="u002">Bob Mehra</option>
                <option value="u003">Carol Das</option>
              </>
            )}
          </select>
        </div>
        
        <div className="feat-grid">
          <div className="feat-chip">
            <div className="feat-chip-label">gender</div>
            <div className="feat-chip-val">
              {userData ? userData.gender : "—"}
            </div>
          </div>
          <div className="feat-chip">
            <div className="feat-chip-label">avg amount</div>
            <div className="feat-chip-val">
              {userData ? `$${userData.avg_amount}` : "—"}
            </div>
          </div>
          <div className="feat-chip">
            <div className="feat-chip-label">date of birth</div>
            <div className="feat-chip-val">
              {userData && userData.dob ? userData.dob.split('T')[0] : "—"}
            </div>
          </div>
          <div className="feat-chip">
            <div className="feat-chip-label">transaction count</div>
            <div className="feat-chip-val">
              {userData ? `${userData.txn_count} txns` : "—"}
            </div>
          </div>
          <div className="feat-chip">
            <div className="feat-chip-label">job</div>
            <div className="feat-chip-val">
              {userData && userData.job ? userData.job : "—"}
            </div>
          </div>
        </div>
      </div>

      <div className={`new-user-note ${isNew ? "" : "hidden"}`}>
        No history found. Behavioral features will use cold-start defaults.
      </div>
    </div>
  );
}

export const UserProfile = React.memo(UserProfileComponent);
