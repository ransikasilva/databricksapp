import React, { useState, useEffect } from 'react';
import { fetchData } from '../api/client';
import './SalesDashboard.css';

function SalesDashboard() {
  const [overview, setOverview] = useState(null);
  const [trends, setTrends] = useState([]);
  const [products, setProducts] = useState([]);
  const [regions, setRegions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [overviewData, trendsData, productsData, regionsData, categoriesData, recentData] = await Promise.all([
        fetchData('sales/overview'),
        fetchData('sales/trends'),
        fetchData('sales/by-product'),
        fetchData('sales/by-region'),
        fetchData('sales/by-category'),
        fetchData('sales/recent')
      ]);

      setOverview(overviewData);
      setTrends(trendsData);
      setProducts(productsData);
      setRegions(regionsData);
      setCategories(categoriesData);
      setRecentSales(recentData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  if (loading) {
    return (
      <div className="sales-dashboard">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading sales analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sales-dashboard">
        <div className="error-card">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={loadAllData} className="btn-retry">Retry</button>
        </div>
      </div>
    );
  }

  const getMaxValue = (data, key) => {
    return Math.max(...data.map(item => item[key]));
  };

  return (
    <div className="sales-dashboard">
      <div className="dashboard-header">
        <h1>Sales Analytics Dashboard</h1>
        <button onClick={loadAllData} className="btn-refresh">Refresh Data</button>
      </div>

      {/* KPI Cards */}
      {overview && (
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-icon">💰</div>
            <div className="kpi-content">
              <div className="kpi-label">Total Revenue</div>
              <div className="kpi-value">{formatCurrency(overview.total_revenue)}</div>
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon">📦</div>
            <div className="kpi-content">
              <div className="kpi-label">Total Orders</div>
              <div className="kpi-value">{formatNumber(overview.total_orders)}</div>
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon">💵</div>
            <div className="kpi-content">
              <div className="kpi-label">Avg Order Value</div>
              <div className="kpi-value">{formatCurrency(overview.avg_order_value)}</div>
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon">👥</div>
            <div className="kpi-content">
              <div className="kpi-label">Unique Customers</div>
              <div className="kpi-value">{formatNumber(overview.unique_customers)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Sales Trends Line Chart */}
      {trends.length > 0 && (
        <div className="chart-card">
          <h3>Sales Trends Over Time</h3>
          <div className="line-chart">
            <div className="chart-container">
              {trends.map((item, index) => {
                const maxRevenue = getMaxValue(trends, 'revenue');
                const height = (item.revenue / maxRevenue) * 200;
                return (
                  <div key={index} className="line-chart-point">
                    <div
                      className="line-bar"
                      style={{ height: `${height}px` }}
                      title={`${item.month}: ${formatCurrency(item.revenue)}`}
                    ></div>
                    <div className="line-label">{item.month.slice(5)}</div>
                    <div className="line-value">{formatCurrency(item.revenue)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="charts-row">
        {/* Top Products Bar Chart */}
        {products.length > 0 && (
          <div className="chart-card half-width">
            <h3>Top Products by Revenue</h3>
            <div className="bar-chart">
              {products.slice(0, 5).map((item, index) => {
                const maxRevenue = getMaxValue(products, 'revenue');
                const width = (item.revenue / maxRevenue) * 100;
                return (
                  <div key={index} className="bar-item">
                    <div className="bar-label">{item.product}</div>
                    <div className="bar-container">
                      <div
                        className="bar-fill"
                        style={{ width: `${width}%` }}
                      ></div>
                      <div className="bar-value">{formatCurrency(item.revenue)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Sales by Region Pie Chart (represented as bars) */}
        {regions.length > 0 && (
          <div className="chart-card half-width">
            <h3>Sales by Region</h3>
            <div className="pie-chart">
              {regions.map((item, index) => {
                const totalRevenue = regions.reduce((sum, r) => sum + r.revenue, 0);
                const percentage = (item.revenue / totalRevenue) * 100;
                const colors = ['#FF3621', '#FF6B4A', '#FFA07A', '#FFB899', '#FFD0B8'];
                return (
                  <div key={index} className="pie-item">
                    <div
                      className="pie-slice"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: colors[index % colors.length]
                      }}
                    ></div>
                    <div className="pie-label">
                      <span className="pie-region">{item.region}</span>
                      <span className="pie-percentage">{percentage.toFixed(1)}%</span>
                      <span className="pie-value">{formatCurrency(item.revenue)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Category Breakdown */}
      {categories.length > 0 && (
        <div className="chart-card">
          <h3>Sales by Category</h3>
          <div className="category-chart">
            {categories.map((item, index) => {
              const totalRevenue = categories.reduce((sum, c) => sum + c.revenue, 0);
              const percentage = (item.revenue / totalRevenue) * 100;
              return (
                <div key={index} className="category-item">
                  <div className="category-header">
                    <span className="category-name">{item.category}</span>
                    <span className="category-revenue">{formatCurrency(item.revenue)}</span>
                  </div>
                  <div className="category-bar-container">
                    <div
                      className="category-bar"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="category-stats">
                    <span>{percentage.toFixed(1)}% of total</span>
                    <span>{formatNumber(item.quantity)} units</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Sales Table */}
      {recentSales.length > 0 && (
        <div className="chart-card">
          <h3>Recent Transactions</h3>
          <div className="table-container">
            <table className="sales-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Region</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.map((sale) => (
                  <tr key={sale.id}>
                    <td>{sale.date}</td>
                    <td>{sale.product}</td>
                    <td><span className="category-badge">{sale.category}</span></td>
                    <td>{sale.region}</td>
                    <td>{sale.quantity}</td>
                    <td>{formatCurrency(sale.unit_price)}</td>
                    <td className="revenue-cell">{formatCurrency(sale.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default SalesDashboard;
