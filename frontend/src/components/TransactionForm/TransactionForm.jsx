import React from "react";
import "./TransactionForm.css";

function TransactionFormComponent({ formData, setFormData, onSubmit, loading, isNew, options }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form className="panel" style={{ marginTop: "12px" }} onSubmit={handleSubmit}>
      <div className="panel-title">Transaction details</div>

      {isNew && (
        <div className="row2">
          <div className="field">
            <label htmlFor="f-gender">Gender</label>
            <select
              id="f-gender"
              name="gender"
              value={formData.gender ?? "M"}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="M">Male</option>
              <option value="F">Female</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="f-dob">Date of Birth</label>
            <input
              type="date"
              id="f-dob"
              name="dob"
              value={formData.dob ?? "1990-01-01"}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>
        </div>
      )}

      {isNew && (
        <div className="row2">
          <div className="field">
            <label htmlFor="f-job">Job</label>
            <select
              id="f-job"
              name="job"
              value={formData.job ?? ""}
              onChange={handleChange}
              disabled={loading}
            >
              {options?.jobs?.length > 0 ? (
                options.jobs.map((j, idx) => (
                  <option key={idx} value={j.job_name}>
                    {j.job_name}
                  </option>
                ))
              ) : (
                <option value="Paramedic">Paramedic</option>
              )}
            </select>
          </div>
        </div>
      )}

      <div className="row2">
        <div className="field">
          <label htmlFor="f-amt">Amount ($)</label>
          <input
            type="number"
            id="f-amt"
            name="amount"
            value={formData.amount ?? 240}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
        <div className="field">
          <label htmlFor="f-hour">Hour of day</label>
          <input
            type="number"
            id="f-hour"
            name="hour"
            value={formData.hour ?? 14}
            onChange={handleChange}
            min="0"
            max="23"
            step="1"
            required
            disabled={loading}
          />
        </div>
      </div>

      <div className="row2">
        <div className="field">
          <label htmlFor="f-cat">Category</label>
          <select
            id="f-cat"
            name="category"
            value={formData.category ?? ""}
            onChange={handleChange}
            disabled={loading}
          >
            {options?.categories?.length > 0 ? (
              options.categories.map((c) => (
                <option key={c.id} value={c.category_placeholder}>
                  {c.category_placeholder}
                </option>
              ))
            ) : (
              <option value="shopping_net">shopping_net</option>
            )}
          </select>
        </div>
        <div className="field">
          <label htmlFor="f-state">State</label>
          <select
            id="f-state"
            name="state"
            value={formData.state ?? ""}
            onChange={handleChange}
            disabled={loading}
          >
            {options?.states?.length > 0 ? (
              options.states.map((s) => (
                <option key={s.id} value={s.state_placeholder}>
                  {s.state_placeholder}
                </option>
              ))
            ) : (
              <option value="AZ">AZ</option>
            )}
          </select>
        </div>

      </div>

      <div className="row2">
        <div className="field">
          <label htmlFor="f-city">City</label>
          <select
            id="f-city"
            name="city"
            value={formData.city ?? ""}
            onChange={handleChange}
            disabled={loading}
          >
            {options?.cities?.length > 0 ? (
              options.cities.map((c, idx) => (
                <option key={idx} value={c.city_name}>
                  {c.city_name}
                </option>
              ))
            ) : (
              <option value="Phoenix">Phoenix</option>
            )}
          </select>
        </div>
        <div className="field">
          <label htmlFor="f-zip">ZIP Code</label>
          <input
            type="number"
            id="f-zip"
            name="zip"
            value={formData.zip ?? 85001}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
      </div>
      <div className="row2">
      </div>

      <button className="submit-btn" type="submit" disabled={loading}>
        {loading ? "Processing..." : "Run inference"}
      </button>
    </form>
  );
}

export const TransactionForm = React.memo(TransactionFormComponent);
