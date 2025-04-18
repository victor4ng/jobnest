// File: src/components/CrewLayout.tsx
import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, Clock, User } from 'lucide-react';

const navItems = [
  { label: 'Jobs', icon: <Home size={20} />, path: '/crew-jobs' },
  { label: 'Clock', icon: <Clock size={20} />, path: '/crew-clock' },
  { label: 'Profile', icon: <User size={20} />, path: '/crew-profile' },
];

const CrewLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-sm flex justify-around py-2">
        {navItems.map(({ label, icon, path }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`flex flex-col items-center text-sm ${location.pathname === path ? 'text-blue-500 font-bold' : 'text-gray-500'}`}
          >
            {icon}
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default CrewLayout;
