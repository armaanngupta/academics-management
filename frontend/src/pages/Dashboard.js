import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import { marksheetAPI } from '../api';
import AppLayout from '../components/AppLayout';
import './Dashboard.css';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const chartColors = ['#0c66e4', '#5b8def', '#6dc8ec', '#9b7bff', '#4cb2a1', '#f4a261'];

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await marksheetAPI.getMarksheetSummary();
        setSummary(response.data.summary);
      } catch (err) {
        setError('Failed to load dashboard summary');
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  return (
    <AppLayout>
      <div className="content-header">
        <div>
          <p className="eyebrow">Marksheet Operations</p>
          <h1>Dashboard</h1>
          <p className="subtitle">
            Focus on unissued marksheets first, then drill into university and age breakdowns.
          </p>
        </div>
        <span className="pill">Updated just now</span>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading || !summary ? (
        <div className="loading">Loading dashboard insights...</div>
      ) : (
        <>
          <section className="dashboard-summary">
            <div className="summary-card summary-highlight">
              <span className="summary-label">Unissued marksheets</span>
              <span className="summary-value">{summary.unissuedTotal}</span>
              <span className="summary-meta">Needs issuance review</span>
            </div>
            <div className="summary-card">
              <span className="summary-label">Issued marksheets</span>
              <span className="summary-value">{summary.issuedTotal}</span>
              <span className="summary-meta">Already delivered</span>
            </div>
            <div className="summary-card">
              <span className="summary-label">Total records</span>
              <span className="summary-value">{summary.totalMarksheets}</span>
              <span className="summary-meta">All academic sessions</span>
            </div>
            <div className="summary-card">
              <span className="summary-label">Added this week</span>
              <span className="summary-value">{summary.recentAdded}</span>
              <span className="summary-meta">Last 7 days</span>
            </div>
          </section>

          <section className="chart-grid">
            <div className="chart-card">
              <div className="chart-header">
                <span className="chart-title">Unissued by university</span>
                <span className="chart-note">Highest volume first</span>
              </div>
              {summary.byUniversity.length === 0 ? (
                <div className="chart-empty">No unissued marksheets yet.</div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={summary.byUniversity} barSize={28}>
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="#0c66e4" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <span className="chart-title">Unissued age buckets</span>
                <span className="chart-note">Time since added</span>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={summary.ageBuckets} barSize={30}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="#5b8def" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <span className="chart-title">Unissued by session</span>
                <span className="chart-note">Semester balance</span>
              </div>
              {summary.bySession.length === 0 ? (
                <div className="chart-empty">No session data available.</div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={summary.bySession} dataKey="value" nameKey="name" innerRadius={60} outerRadius={92}>
                      {summary.bySession.map((entry, index) => (
                        <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <span className="chart-title">Unissued by academic year</span>
                <span className="chart-note">Yearly backlog trend</span>
              </div>
              {summary.byAcademicYear.length === 0 ? (
                <div className="chart-empty">No academic year data.</div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={summary.byAcademicYear}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#0c66e4" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </section>

          <section className="chart-grid">
            <div className="chart-card">
              <div className="chart-header">
                <span className="chart-title">Top unissued subjects</span>
                <span className="chart-note">Focus areas</span>
              </div>
              {summary.bySubject.length === 0 ? (
                <div className="chart-empty">No subject insights yet.</div>
              ) : (
                <div className="insight-list">
                  {summary.bySubject.map((item) => (
                    <div className="insight-item" key={item.name}>
                      <span>{item.name}</span>
                      <strong>{item.value}</strong>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </AppLayout>
  );
};

export default Dashboard;
