import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Chat from './pages/Chat';

export default function App() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Read stored credentials on mount to preserve login state across page reloads
  useEffect(() => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const userId = localStorage.getItem('user_id');

    if (token && username && userId) {
      setUser({
        token,
        username,
        userId: parseInt(userId, 10),
      });
    }
    setCheckingAuth(false);
  }, []);

  const handleLogout = () => {
    // Clear storage cache
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('user_id');
    // Clear React user state
    setUser(null);
  };

  // Protected Route wrapper component
  const ProtectedRoute = ({ children }) => {
    if (checkingAuth) {
      // Small loader during local storage resolution
      return (
        <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      );
    }
    
    // Redirect to login if user is unauthenticated
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    
    return children;
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Registration view */}
        <Route 
          path="/signup" 
          element={user ? <Navigate to="/chat" replace /> : <Signup />} 
        />

        {/* Login view */}
        <Route 
          path="/login" 
          element={user ? <Navigate to="/chat" replace /> : <Login onLoginSuccess={setUser} />} 
        />

        {/* Secure Chat view */}
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chat user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />

        {/* Fallback routing */}
        <Route 
          path="*" 
          element={<Navigate to={user ? "/chat" : "/login"} replace />} 
        />
      </Routes>
    </BrowserRouter>
  );
}
