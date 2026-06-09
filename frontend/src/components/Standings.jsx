import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export default function Standings() {
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStandings = async () => {
    try {
      const response = await axios.get(`${API_URL}/standings`);
      setStandings(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching standings");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStandings();
    // THE "POOR MAN'S SOCKET" - Auto-refresh standings every 10 seconds!
    const interval = setInterval(fetchStandings, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-400 mt-10">Calculating...</div>;

  return (
    <div className="p-2 pb-24">
      <div className="bg-card rounded-xl shadow-lg border border-gray-800 overflow-hidden">
        
        <div className="grid grid-cols-12 gap-1 p-3 bg-gray-900 border-b border-gray-800 text-[9px] sm:text-[11px] font-bold text-gray-400 tracking-widest uppercase text-center">
          <div className="col-span-2">RK</div>
          <div className="col-span-3 text-left pl-1">TEAM</div>
          <div className="col-span-1">P</div>
          <div className="col-span-1">W</div>
          <div className="col-span-1">L</div>
          <div className="col-span-1">D</div>
          <div className="col-span-1 text-primary">PTS</div>
          <div className="col-span-2">GD</div>
        </div>

        <div className="divide-y divide-gray-800">
          {standings.map((team, index) => {
            const isTop4 = index < 4;
            const isFirst = index === 0;

            // Grab the last 5 match results for the Form Guide
            const recentForm = team.form.slice(-5);

            return (
              <div key={team.teamName} className={`grid grid-cols-12 gap-1 p-3 items-center transition-colors ${isTop4 ? 'bg-card hover:bg-gray-800' : 'bg-card/50 opacity-75'}`}>
                
                <div className="col-span-2 flex justify-center">
                  <span className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-black ${
                    isFirst ? 'bg-yellow-500 text-dark shadow-[0_0_10px_rgba(234,179,8,0.5)]' 
                    : isTop4 ? 'bg-primary/20 text-primary' : 'text-gray-500'
                  }`}>
                    {index + 1}
                  </span>
                </div>

                <div className="col-span-3 flex flex-col justify-center pl-1">
                  <div className="font-bold text-xs sm:text-sm text-white truncate">{team.teamName}</div>
                  
                  {/* NEW: THE FORM GUIDE DOTS */}
                  <div className="flex gap-1 mt-1">
                    {recentForm.map((res, i) => (
                      <span key={i} className={`w-2 h-2 rounded-full ${
                        res === 'W' ? 'bg-emerald-400' : res === 'L' ? 'bg-red-500' : 'bg-gray-400'
                      }`}></span>
                    ))}
                    {/* Add empty dots if they haven't played 5 matches yet */}
                    {[...Array(Math.max(0, 5 - recentForm.length))].map((_, i) => (
                      <span key={`empty-${i}`} className="w-2 h-2 rounded-full border border-gray-700"></span>
                    ))}
                  </div>
                </div>

                <div className="col-span-1 text-center text-xs font-medium text-gray-400">{team.played}</div>
                <div className="col-span-1 text-center text-xs font-bold text-emerald-400">{team.wins}</div>
                <div className="col-span-1 text-center text-xs font-bold text-red-400">{team.losses}</div>
                <div className="col-span-1 text-center text-xs font-bold text-blue-400">{team.draws}</div>
                <div className="col-span-1 text-center text-sm font-black text-primary">{team.points}</div>
                <div className={`col-span-2 text-center text-xs sm:text-sm font-bold tracking-tighter ${team.goalDiff > 0 ? 'text-emerald-400' : team.goalDiff < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                  {team.goalDiff > 0 ? `+${team.goalDiff}` : team.goalDiff}
                </div>

              </div>
            );
          })}
        </div>
      </div>
      
      <div className="mt-4 px-2 text-[9px] text-gray-500 flex items-center justify-between uppercase tracking-wider font-semibold">
        <span className="flex gap-2">🟢 Win 🔴 Loss ⚪ Draw</span>
        <span>Top 4 advance</span>
      </div>
    </div>
  );
}