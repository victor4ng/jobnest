// File: src/App.tsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Layout from './components/Layout';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import Jobs from './pages/Jobs';
import Crew from './pages/Crew';
import Inventory from './pages/Inventory';
import PauseJob from './pages/PauseJob';

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={user ? <Layout /> : <Navigate to="/login" replace />}
        >
          <Route index element={<Dashboard />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="crew" element={<Crew />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="jobs/:id/pause" element={<PauseJob />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
