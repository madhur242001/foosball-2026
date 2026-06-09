import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Calendar, Trophy, Users } from 'lucide-react';
import Fixtures from './components/Fixtures';
import Standings from './components/Standings';
import Teams from './components/Teams';

// The Top Header with Strict Admin Gatekeeper
const Header = () => {
  const handleAdminUnlock = () => {
    const isAlreadyAdmin = sessionStorage.getItem('adminKey');
    if (isAlreadyAdmin) {
      if(window.confirm("Logout of Admin Mode?")) {
        sessionStorage.removeItem('adminKey');
        window.location.reload();
      }
      return;
    }

    const passcode = prompt("Enter Tournament Director Passcode:");
    
    // FIX 1: Check if the passcode exactly matches our environment variable
    const CORRECT_PASSCODE = import.meta.env.VITE_ADMIN_KEY || "Foosball2026";
    
    if (passcode === CORRECT_PASSCODE) {
      sessionStorage.setItem('adminKey', passcode);
      window.location.reload(); 
    } else if (passcode !== null) { 
      // If they typed something wrong (and didn't just hit 'Cancel')
      alert("Access Denied: Incorrect passcode.");
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-dark/80 backdrop-blur-md border-b border-gray-800/50 p-4 z-50 flex justify-between items-center shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      <h1 className="text-xl font-bold tracking-wider text-white">
        FOOSBALL <span className="text-primary">2026</span>
      </h1>
      <button 
        onClick={handleAdminUnlock}
        className="opacity-30 hover:opacity-100 transition-opacity cursor-default"
      >
        ⚙️
      </button>
    </header>
  );
};

// The Mobile Bottom Navigation Bar
const BottomNav = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { path: '/', icon: <Calendar size={24} />, label: 'Fixtures' },
    { path: '/standings', icon: <Trophy size={24} />, label: 'Standings' },
    { path: '/teams', icon: <Users size={24} />, label: 'Teams' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-dark/80 backdrop-blur-lg border-t border-gray-800/50 pb-safe z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = currentPath === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
                isActive ? 'text-primary' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {item.icon}
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

// Main App Shell
export default function App() {
  return (
    <Router>
      <div className="min-h-screen text-white pb-20 pt-16 font-sans selection:bg-primary selection:text-white">
        <Header />
        
        <main className="max-w-md mx-auto relative">
          <Routes>
            <Route path="/" element={<Fixtures />} />
            <Route path="/standings" element={<Standings />} />
            <Route path="/teams" element={<Teams />} />
          </Routes>
        </main>

        <BottomNav />
      </div>
    </Router>
  );
}