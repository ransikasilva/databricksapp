import React, { useState, useEffect } from 'react';
import { fetchData } from '../api/client';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  FiDollarSign,
  FiShoppingCart,
  FiTrendingUp,
  FiUsers,
  FiRefreshCw
} from 'react-icons/fi';
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

  const COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#6366F1', '#EF4444', '#14B8A6'];

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
              {entry.name}: {typeof entry.value === 'number' && entry.name.toLowerCase().includes('revenue')
                ? formatCurrency(entry.value)
                : formatNumber(entry.value)}
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
          <button onClick={loadAllData} className="btn-retry">
            <FiRefreshCw /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="sales-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>Sales Analytics</h1>
          <p className="dashboard-subtitle">February 20, 2026</p>
        </div>
        <button onClick={loadAllData} className="btn-refresh">
          <FiRefreshCw size={18} /> Refresh Data
        </button>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card kpi-revenue">
          <div className="kpi-icon-wrapper">
            <FiDollarSign size={32} />
          </div>
          <div className="kpi-content">
            <div className="kpi-label">Total Revenue</div>
            <div className="kpi-value">{formatCurrency(overview?.total_revenue || 0)}</div>
            <div className="kpi-change">+12.5% from last month</div>
          </div>
        </div>

        <div className="kpi-card kpi-orders">
          <div className="kpi-icon-wrapper">
            <FiShoppingCart size={32} />
          </div>
          <div className="kpi-content">
            <div className="kpi-label">Total Orders</div>
            <div className="kpi-value">{formatNumber(overview?.total_orders || 0)}</div>
            <div className="kpi-change">+8.3% from last month</div>
          </div>
        </div>

        <div className="kpi-card kpi-avg">
          <div className="kpi-icon-wrapper">
            <FiTrendingUp size={32} />
          </div>
          <div className="kpi-content">
            <div className="kpi-label">Avg Order Value</div>
            <div className="kpi-value">{formatCurrency(overview?.avg_order_value || 0)}</div>
            <div className="kpi-change">+5.2% from last month</div>
          </div>
        </div>

        <div className="kpi-card kpi-customers">
          <div className="kpi-icon-wrapper">
            <FiUsers size={32} />
          </div>
          <div className="kpi-content">
            <div className="kpi-label">Unique Customers</div>
            <div className="kpi-value">{formatNumber(overview?.unique_customers || 0)}</div>
            <div className="kpi-change">+3.1% from last month</div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-container">
        {/* Sales Trends */}
        <div className="chart-card full-width">
          <div className="chart-header">
            <h3>Sales Trends Over Time</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trends}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#a8a29e" />
              <YAxis stroke="#a8a29e" />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products */}
        <div className="chart-card half-width">
          <div className="chart-header">
            <h3>Top Products by Revenue</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={products.slice(0, 6)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" stroke="#a8a29e" />
              <YAxis type="category" dataKey="product" stroke="#a8a29e" width={100} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" fill="#3B82F6" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Regional Distribution */}
        <div className="chart-card half-width">
          <div className="chart-header">
            <h3>Sales by Region</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
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

        {/* Category Performance */}
        <div className="chart-card half-width">
          <div className="chart-header">
            <h3>Category Performance</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categories}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="category" stroke="#a8a29e" />
              <YAxis stroke="#a8a29e" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="revenue" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
              <Bar dataKey="quantity" fill="#EC4899" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Order Volume Trends */}
        <div className="chart-card half-width">
          <div className="chart-header">
            <h3>Order Volume Trends</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#a8a29e" />
              <YAxis stroke="#a8a29e" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="orders" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="quantity" stroke="#F59E0B" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Transactions */}
        <div className="chart-card full-width">
          <div className="chart-header">
            <h3>Recent Transactions</h3>
          </div>
          <div className="table-wrapper">
            <table className="sales-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Region</th>
                  <th>Quantity</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.map((sale, index) => (
                  <tr key={index}>
                    <td><span className="date-badge">{sale.date}</span></td>
                    <td>{sale.product}</td>
                    <td><span className="category-badge">{sale.category}</span></td>
                    <td>{sale.region}</td>
                    <td className="text-center">{sale.quantity}</td>
                    <td className="revenue-cell">{formatCurrency(sale.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SalesDashboard;
