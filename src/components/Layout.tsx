// File: src/components/Layout.tsx
import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';

const Layout: React.FC = () => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('jobnest_user');
    navigate('/login');
  };

  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-gray-100 p-4">
        <h1 className="text-2xl font-bold mb-8">JobNest</h1>
        <nav className="flex flex-col gap-4">
          <Link to="/">Dashboard</Link>
          <Link to="/jobs">Jobs</Link>
          <Link to="/crew">Crew</Link>
          <Link to="/inventory">Inventory</Link>
          <button onClick={logout} className="text-red-500 mt-auto">Logout</button>
        </nav>
      </aside>
      <main className="flex-1 p-6 bg-white overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
