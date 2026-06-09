import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export default function Teams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchTeams();
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-400 mt-10">Loading roster...</div>;

  // A list of cool neon colors to give each team a unique dot indicator
  const dotColors = [
    'bg-emerald-400', 'bg-blue-400', 'bg-purple-400', 
    'bg-orange-400', 'bg-pink-400', 'bg-yellow-400', 
    'bg-cyan-400', 'bg-red-400'
  ];

  return (
    <div className="p-4 pb-24 max-w-md mx-auto">
      
      {/* Sleek Header */}
      <div className="flex items-center gap-3 mb-6 mt-2">
        <h2 className="text-xl font-black tracking-widest uppercase text-white drop-shadow-md">
          The Roster
        </h2>
        <div className="h-[1px] flex-1 bg-gradient-to-r from-gray-700 to-transparent"></div>
      </div>

      {/* Teams List */}
      <div className="space-y-4">
        {teams.map((team, index) => {
          // Assign a repeating color dot to each card
          const accentColor = dotColors[index % dotColors.length];

          return (
            <div 
              key={team._id || team.name} 
              // CRITICAL FIX: overflow-hidden keeps the giant letter inside the box!
              className="relative bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 overflow-hidden shadow-lg transition-transform active:scale-95"
            >
              
              {/* THE WATERMARK LETTER (Fixed and Locked in place) */}
              <div className="absolute -right-4 -bottom-6 text-[140px] font-black text-white/[0.03] select-none pointer-events-none leading-none z-0">
                {team.name.charAt(0).toUpperCase()}
              </div>

              {/* CARD CONTENT */}
              <div className="relative z-10">
                <h3 className="text-2xl font-black text-white tracking-wide mb-2">
                  {team.name}
                </h3>
                
                <div className="flex items-center gap-2 text-sm text-gray-400 font-medium">
                  {/* Glowing neon dot */}
                  <span className={`w-2 h-2 rounded-full ${accentColor} shadow-[0_0_8px_currentColor]`}></span>
                  
                  {/* Player Names */}
                  <span>
                    {Array.isArray(team.players) 
                      ? team.players.join(' & ') 
                      : team.players}
                  </span>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}