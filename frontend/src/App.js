import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateMarksheet from './pages/CreateMarksheet';
import Marksheets from './pages/Marksheets';
import Students from './pages/Students';
import AdminManagement from './pages/AdminManagement';
import AcademicManagement from './pages/AcademicManagement';
import './App.css';

const PrivateRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/" />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/create"
            element={
              <PrivateRoute>
                <CreateMarksheet />
              </PrivateRoute>
            }
          />
          <Route
            path="/marksheets"
            element={
              <PrivateRoute>
                <Marksheets />
              </PrivateRoute>
            }
          />
          <Route
            path="/students"
            element={
              <PrivateRoute>
                <Students />
              </PrivateRoute>
            }
          />
          <Route
            path="/settings/academics"
            element={
              <PrivateRoute>
                <AcademicManagement />
              </PrivateRoute>
            }
          />
          <Route
            path="/settings/admins"
            element={
              <PrivateRoute>
                <AdminManagement />
              </PrivateRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
