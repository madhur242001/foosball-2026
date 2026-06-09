import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export default function Teams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // NEW: Admin states
  const adminKey = sessionStorage.getItem('adminKey');
  const [editingTeam, setEditingTeam] = useState(null);
  const [editName, setEditName] = useState('');

  const fetchTeams = async () => {
    try {
      const response = await axios.get(`${API_URL}/teams`);
      setTeams(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching teams", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  // NEW: Handle Team Rename
  const handleRename = async (oldName) => {
    const newName = editName.trim();
    if (!newName || newName === oldName) {
      setEditingTeam(null);
      return;
    }
    
    if(!window.confirm(`Rename "${oldName}" to "${newName}"? This will instantly update all matches and standings.`)) return;

    try {
      await axios.post(`${API_URL}/teams/rename`, {
        authKey: adminKey,
        oldName: oldName,
        newName: newName
      });
      setEditingTeam(null);
      fetchTeams(); // Refresh the list
    } catch (error) {
      alert("Failed to rename team. Make sure your admin key is correct.");
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-400 mt-10">Loading roster...</div>;

  const dotColors = [
    'bg-emerald-400', 'bg-blue-400', 'bg-purple-400', 
    'bg-orange-400', 'bg-pink-400', 'bg-yellow-400', 
    'bg-cyan-400', 'bg-red-400'
  ];

  return (
    <div className="p-4 pb-24 max-w-md mx-auto">
      
      <div className="flex items-center gap-3 mb-6 mt-2">
        <h2 className="text-xl font-black tracking-widest uppercase text-white drop-shadow-md">
          The Roster
        </h2>
        <div className="h-[1px] flex-1 bg-gradient-to-r from-gray-700 to-transparent"></div>
      </div>

      <div className="space-y-4">
        {teams.map((team, index) => {
          const accentColor = dotColors[index % dotColors.length];

          return (
            <div 
              key={team._id || team.name} 
              className="relative bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 overflow-hidden shadow-lg transition-all"
            >
              
              {/* THE WATERMARK LETTER */}
              <div className="absolute -right-4 -bottom-6 text-[140px] font-black text-white/[0.03] select-none pointer-events-none leading-none z-0">
                {team.name.charAt(0).toUpperCase()}
              </div>

              {/* CARD CONTENT */}
              <div className="relative z-10">
                
                <div className="flex justify-between items-start mb-2">
                  {/* EDIT MODE vs DISPLAY MODE */}
                  {editingTeam === team.name ? (
                    <div className="flex-1 mr-4">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full bg-black/50 text-white font-black text-xl py-2 px-3 rounded-lg border border-primary outline-none focus:ring-2 focus:ring-primary shadow-inner mb-3 transition-all"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleRename(team.name)} 
                          className="text-xs bg-primary text-dark font-black px-4 py-2 rounded-lg hover:bg-emerald-400 active:scale-95 transition-all shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                        >
                          SAVE
                        </button>
                        <button 
                          onClick={() => setEditingTeam(null)} 
                          className="text-xs bg-gray-800 text-gray-300 font-bold px-4 py-2 rounded-lg hover:bg-gray-700 active:scale-95 transition-all border border-gray-700"
                        >
                          CANCEL
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-2xl font-black text-white tracking-wide">
                        {team.name}
                      </h3>
                      
                      {/* ADMIN EDIT BUTTON */}
                      {adminKey && (
                        <button
                          onClick={() => { setEditingTeam(team.name); setEditName(team.name); }}
                          className="text-[10px] uppercase tracking-widest font-bold text-gray-500 hover:text-primary bg-gray-800/50 hover:bg-gray-800 px-3 py-1.5 rounded-md transition-all active:scale-95 border border-gray-700/50"
                        >
                          Edit
                        </button>
                      )}
                    </>
                  )}
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-400 font-medium">
                  <span className={`w-2 h-2 rounded-full ${accentColor} shadow-[0_0_8px_currentColor]`}></span>
                  <span>{Array.isArray(team.players) ? team.players.join(' & ') : team.players}</span>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}