import React, { useState, useEffect } from 'react';
import { fetchData } from '../api/client';
import './Dashboard.css';

function Dashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchData('sample-data');

      if (result.error) {
        setError(result.error);
      } else {
        setData(result);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading data from Databricks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="error-card">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={loadData} className="btn-retry">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Dashboard</h2>
        <button onClick={loadData} className="btn-refresh">Refresh Data</button>
      </div>

      <div className="card">
        <h3>Sample Data from Databricks</h3>
        {data.length > 0 ? (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  {Object.keys(data[0]).map((key) => (
                    <th key={key}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, idx) => (
                  <tr key={idx}>
                    {Object.values(row).map((value, i) => (
                      <td key={i}>{String(value)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="no-data">No data available</p>
        )}
      </div>

      <div className="info-card">
        <h3>Next Steps</h3>
        <ul>
          <li>Update the SQL query in <code>app.py</code> to query your actual Databricks tables</li>
          <li>Add more API endpoints for different data sources</li>
          <li>Create new pages in <code>src/pages/</code></li>
          <li>Add filters, search, or visualizations to your data</li>
        </ul>
      </div>
    </div>
  );
}

export default Dashboard;
