import React, { useState, useEffect } from 'react';
import { fetchData } from '../api/client';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
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

  const COLORS = ['#FF3621', '#FF6B4A', '#FFA07A', '#FFB899', '#FFD0B8', '#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b'];

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
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="label">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
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

  return (
    <div className="sales-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>📊 Sales Analytics Dashboard</h1>
          <p className="dashboard-subtitle">Real-time insights and performance metrics</p>
        </div>
        <button onClick={loadAllData} className="btn-refresh">
          🔄 Refresh Data
        </button>
      </div>

      {/* KPI Cards */}
      {overview && (
        <div className="kpi-grid">
          <div className="kpi-card kpi-revenue">
            <div className="kpi-icon">💰</div>
            <div className="kpi-content">
              <div className="kpi-label">Total Revenue</div>
              <div className="kpi-value">{formatCurrency(overview.total_revenue)}</div>
              <div className="kpi-change">+12.5% from last period</div>
            </div>
          </div>
          <div className="kpi-card kpi-orders">
            <div className="kpi-icon">📦</div>
            <div className="kpi-content">
              <div className="kpi-label">Total Orders</div>
              <div className="kpi-value">{formatNumber(overview.total_orders)}</div>
              <div className="kpi-change">+8.2% from last period</div>
            </div>
          </div>
          <div className="kpi-card kpi-avg">
            <div className="kpi-icon">💵</div>
            <div className="kpi-content">
              <div className="kpi-label">Avg Order Value</div>
              <div className="kpi-value">{formatCurrency(overview.avg_order_value)}</div>
              <div className="kpi-change">+3.8% from last period</div>
            </div>
          </div>
          <div className="kpi-card kpi-customers">
            <div className="kpi-icon">👥</div>
            <div className="kpi-content">
              <div className="kpi-label">Unique Customers</div>
              <div className="kpi-value">{formatNumber(overview.unique_customers)}</div>
              <div className="kpi-change">+15.3% from last period</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Charts Row */}
      <div className="charts-container">
        {/* Sales Trends - Area Chart */}
        {trends.length > 0 && (
          <div className="chart-card full-width">
            <div className="chart-header">
              <h3>📈 Sales Trends Over Time</h3>
              <p>Monthly revenue and order volume</p>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={trends}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF3621" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#FF3621" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#667eea" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area type="monotone" dataKey="revenue" stroke="#FF3621" fillOpacity={1} fill="url(#colorRevenue)" name="Revenue" />
                <Area type="monotone" dataKey="orders" stroke="#667eea" fillOpacity={1} fill="url(#colorOrders)" name="Orders" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top Products - Bar Chart */}
        {products.length > 0 && (
          <div className="chart-card half-width">
            <div className="chart-header">
              <h3>🏆 Top Products</h3>
              <p>Best performing products by revenue</p>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={products.slice(0, 6)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" stroke="#666" />
                <YAxis dataKey="product" type="category" stroke="#666" width={100} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" fill="#FF3621" radius={[0, 8, 8, 0]} name="Revenue">
                  {products.slice(0, 6).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Regional Sales - Pie Chart */}
        {regions.length > 0 && (
          <div className="chart-card half-width">
            <div className="chart-header">
              <h3>🌍 Sales by Region</h3>
              <p>Geographic revenue distribution</p>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={regions}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ region, percent }) => `${region} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="revenue"
                >
                  {regions.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Category Performance - Radar Chart */}
        {categories.length > 0 && (
          <div className="chart-card half-width">
            <div className="chart-header">
              <h3>📊 Category Performance</h3>
              <p>Multi-dimensional category analysis</p>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart data={categories}>
                <PolarGrid stroke="#e0e0e0" />
                <PolarAngleAxis dataKey="category" stroke="#666" />
                <PolarRadiusAxis stroke="#666" />
                <Radar name="Revenue" dataKey="revenue" stroke="#FF3621" fill="#FF3621" fillOpacity={0.6} />
                <Radar name="Quantity" dataKey="quantity" stroke="#667eea" fill="#667eea" fillOpacity={0.6} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Monthly Order Trends - Line Chart */}
        {trends.length > 0 && (
          <div className="chart-card half-width">
            <div className="chart-header">
              <h3>📉 Order Trends</h3>
              <p>Monthly order volume and quantity</p>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="orders" stroke="#FF3621" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} name="Orders" />
                <Line type="monotone" dataKey="quantity" stroke="#667eea" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} name="Quantity" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Recent Transactions Table */}
      {recentSales.length > 0 && (
        <div className="chart-card full-width">
          <div className="chart-header">
            <h3>🔔 Recent Transactions</h3>
            <p>Latest 20 sales transactions</p>
          </div>
          <div className="table-wrapper">
            <table className="sales-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Region</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Revenue</th>
                  <th>Customer</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.map((sale) => (
                  <tr key={sale.id}>
                    <td><span className="date-badge">{sale.date}</span></td>
                    <td><strong>{sale.product}</strong></td>
                    <td><span className="category-badge">{sale.category}</span></td>
                    <td>{sale.region}</td>
                    <td className="text-center">{sale.quantity}</td>
                    <td>{formatCurrency(sale.unit_price)}</td>
                    <td className="revenue-cell">{formatCurrency(sale.revenue)}</td>
                    <td className="customer-id">{sale.customer_id}</td>
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
