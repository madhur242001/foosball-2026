import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export default function Teams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Check if Admin is logged in
  const adminKey = sessionStorage.getItem('adminKey');

  const fetchTeams = async () => {
    try {
      const response = await axios.get(`${API_URL}/teams`);
      setTeams(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching teams");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleRename = async (oldName) => {
    const newName = prompt(`Enter new name for ${oldName}:`);
    
    // Cancel if they hit escape, typed nothing, or typed the exact same name
    if (!newName || newName.trim() === '' || newName === oldName) return;

    try {
      await axios.post(`${API_URL}/teams/rename`, {
        authKey: adminKey,
        oldName: oldName,
        newName: newName.trim()
      });
      
      alert(`Successfully renamed to ${newName}!`);
      fetchTeams(); // Reload the list to show the change instantly
    } catch (err) {
      alert("Failed to rename team. Check your admin connection.");
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-400 mt-10">Loading Roster...</div>;

  return (
    <div className="p-4 pb-24">
      <div className="flex items-center gap-2 mb-6 px-2">
        <h2 className="text-2xl font-black tracking-wider text-white uppercase">The Roster</h2>
        <div className="h-1 flex-1 bg-gray-800 rounded-full"></div>
      </div>

      <div className="space-y-4">
        {teams.map((team) => (
          <div 
            key={team._id || team.name} 
            className={`bg-gradient-to-r ${team.accent} rounded-xl p-5 border ${team.border} shadow-lg flex flex-col justify-center relative overflow-hidden`}
          >
            {/* Faint Background Letter */}
            <div className="absolute -right-4 -top-4 opacity-5 text-8xl font-black">
              {team.name[0]}
            </div>

            <div className="flex justify-between items-start z-10">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">{team.name}</h3>
                <p className="text-gray-400 text-sm font-medium tracking-wide flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block"></span>
                  {team.players}
                </p>
              </div>
              
              {/* Feature: Admin Edit Button */}
              {adminKey && (
                <button 
                  onClick={() => handleRename(team.name)}
                  className="bg-gray-800/80 hover:bg-gray-700 text-xs font-bold px-3 py-1.5 rounded-md border border-gray-600 transition shadow-sm"
                >
                  Edit Name
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}