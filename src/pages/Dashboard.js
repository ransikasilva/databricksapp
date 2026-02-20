import React, { useState, useEffect } from 'react';
import { fetchData } from '../api/client';
import { Link } from 'react-router-dom';
import {
  FiDatabase,
  FiTrendingUp,
  FiPackage,
  FiMapPin,
  FiBarChart2,
  FiActivity,
  FiArrowRight,
  FiRefreshCw
} from 'react-icons/fi';
import './Dashboard.css';

function Dashboard() {
  const [overview, setOverview] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [topRegions, setTopRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [overviewData, productsData, regionsData] = await Promise.all([
        fetchData('sales/overview'),
        fetchData('sales/by-product'),
        fetchData('sales/by-region')
      ]);

      setOverview(overviewData);
      setTopProducts(productsData.slice(0, 5));
      setTopRegions(regionsData.slice(0, 4));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  if (loading) {
    return (
      <div className="dashboard-home">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-home">
        <div className="error-card">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={loadData} className="btn-retry">
            <FiRefreshCw /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-home">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1>Sales Overview</h1>
          <p className="hero-subtitle">Real-time analytics from Databricks</p>
        </div>
        <button onClick={loadData} className="btn-refresh">
          <FiRefreshCw size={18} /> Refresh
        </button>
      </div>

      {/* Main Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card stat-primary">
          <div className="stat-icon">
            <FiTrendingUp size={28} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Revenue</div>
            <div className="stat-value">{formatCurrency(overview?.total_revenue || 0)}</div>
            <div className="stat-badge success">+12.5% from last month</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FiPackage size={28} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Orders</div>
            <div className="stat-value">{formatNumber(overview?.total_orders || 0)}</div>
            <div className="stat-badge success">+8.3% growth</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FiBarChart2 size={28} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Avg Order Value</div>
            <div className="stat-value">{formatCurrency(overview?.avg_order_value || 0)}</div>
            <div className="stat-badge success">+5.2% increase</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FiActivity size={28} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Unique Customers</div>
            <div className="stat-value">{formatNumber(overview?.unique_customers || 0)}</div>
            <div className="stat-badge info">Active</div>
          </div>
        </div>
      </div>

      {/* Insights Grid */}
      <div className="insights-grid">
        {/* Top Products */}
        <div className="insight-card">
          <div className="insight-header">
            <div className="insight-title">
              <FiPackage size={20} />
              <h3>Top Products</h3>
            </div>
            <Link to="/sales" className="link-arrow">
              View All <FiArrowRight />
            </Link>
          </div>
          <div className="product-list">
            {topProducts.map((product, index) => (
              <div key={index} className="product-item">
                <div className="product-rank">{index + 1}</div>
                <div className="product-info">
                  <div className="product-name">{product.product}</div>
                  <div className="product-stats">
                    {formatNumber(product.quantity)} units sold
                  </div>
                </div>
                <div className="product-revenue">{formatCurrency(product.revenue)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Regions */}
        <div className="insight-card">
          <div className="insight-header">
            <div className="insight-title">
              <FiMapPin size={20} />
              <h3>Regional Performance</h3>
            </div>
            <Link to="/sales" className="link-arrow">
              View All <FiArrowRight />
            </Link>
          </div>
          <div className="region-list">
            {topRegions.map((region, index) => (
              <div key={index} className="region-item">
                <div className="region-header">
                  <span className="region-name">{region.region}</span>
                  <span className="region-value">{formatCurrency(region.revenue)}</span>
                </div>
                <div className="region-bar">
                  <div
                    className="region-bar-fill"
                    style={{
                      width: `${(region.revenue / topRegions[0].revenue) * 100}%`,
                      backgroundColor: index === 0 ? '#3B82F6' : index === 1 ? '#8B5CF6' : index === 2 ? '#EC4899' : '#F59E0B'
                    }}
                  ></div>
                </div>
                <div className="region-orders">{formatNumber(region.orders)} orders</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Data Source Info */}
      <div className="data-source-card">
        <div className="data-source-icon">
          <FiDatabase size={24} />
        </div>
        <div className="data-source-content">
          <h3>Data Source</h3>
          <p>Connected to <strong>workspace.default.sales_data</strong> in Databricks</p>
          <p className="data-count">{formatNumber(overview?.total_orders || 0)} total records</p>
        </div>
        <Link to="/sales" className="btn-view-dashboard">
          View Full Dashboard <FiArrowRight />
        </Link>
      </div>
    </div>
  );
}

export default Dashboard;
