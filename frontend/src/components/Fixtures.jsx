import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Confetti from 'react-confetti';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export default function Fixtures() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter State
  const [filterTeam, setFilterTeam] = useState('All');

  const adminKey = sessionStorage.getItem('adminKey');
  const [editingMatch, setEditingMatch] = useState(null);
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');
  const [isBy, setIsBy] = useState(false);

  const fetchMatches = async () => {
    try {
      const response = await axios.get(`${API_URL}/matches`);
      setMatches(response.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
    // Auto-refresh matches every 10 seconds
    const interval = setInterval(fetchMatches, 10000);
    return () => clearInterval(interval);
  }, []);

  // -- Handlers --
  const handleGeneratePlayoffs = async () => {
    if(!window.confirm("Sync Top 4?")) return;
    try {
      await axios.post(`${API_URL}/playoffs/generate`, { authKey: adminKey });
      fetchMatches();
    } catch (err) { alert("Cannot sync: Playoffs started."); }
  };

  const handleResetPlayoffs = async () => {
    if(!window.confirm("Wipe playoff bracket?")) return;
    await axios.post(`${API_URL}/playoffs/reset`, { authKey: adminKey });
    fetchMatches();
  };

  const handleUpdateScore = async (e) => {
    e.preventDefault();
    if (!isBy && (parseInt(homeScore) < 0 || parseInt(homeScore) > 10 || parseInt(awayScore) < 0 || parseInt(awayScore) > 10)) {
      return alert("Invalid Score!");
    }
    try {
      await axios.post(`${API_URL}/matches/${editingMatch._id}`, {
        authKey: adminKey, homeScore: isBy ? 0 : parseInt(homeScore), awayScore: isBy ? 0 : parseInt(awayScore), isDraw: isBy
      });
      setEditingMatch(null); fetchMatches();
    } catch (e) { alert("Update failed."); }
  };

  const handleResetMatch = async (id) => {
    if(!window.confirm("Reset match?")) return;
    await axios.post(`${API_URL}/matches/${id}/reset`, { authKey: adminKey });
    fetchMatches();
  };

  if (loading) return <div className="p-8 text-center text-gray-400 mt-10">Loading...</div>;

  // -- Derived Logic --
  const match43 = matches.find(m => m.matchId === 43);
  const match44 = matches.find(m => m.matchId === 44);
  const isPlayoffStarted = (match43 && match43.isCompleted) || (match44 && match44.isCompleted);
  
  // Confetti Trigger (Check if the Final Match is done)
  const finalMatch = matches.find(m => m.matchId === 46);
  const showConfetti = finalMatch && finalMatch.isCompleted && finalMatch.winner !== "Draw";

  // Extract unique team names for the filter dropdown
  const allTeams = Array.from(new Set(matches.flatMap(m => [m.homeTeam, m.awayTeam])
    .filter(t => !t.startsWith("Rank") && !t.startsWith("Winner") && !t.startsWith("Loser") && t !== "Draw"))).sort();

  // Filter the matches based on dropdown selection
  const displayedMatches = filterTeam === 'All' 
    ? matches 
    : matches.filter(m => m.homeTeam === filterTeam || m.awayTeam === filterTeam);

  return (
    <div className="p-4 pb-24 space-y-4">
      
      {/* CONFETTI OVERLAY */}
      {showConfetti && (
        <div className="fixed inset-0 z-[200] pointer-events-none">
          <Confetti width={window.innerWidth} height={window.innerHeight} recycle={true} numberOfPieces={300} />
          <div className="absolute top-1/4 left-0 w-full text-center animate-bounce">
            <h1 className="text-5xl font-black text-white drop-shadow-[0_0_15px_rgba(255,215,0,0.8)] tracking-widest uppercase">
              {finalMatch.winner}
            </h1>
            <h2 className="text-2xl font-bold text-primary mt-2">2026 CHAMPIONS</h2>
          </div>
        </div>
      )}

      {/* TEAM FILTER DROPDOWN */}
      <div className="relative mb-6">
        <select 
          value={filterTeam} 
          onChange={(e) => setFilterTeam(e.target.value)}
          className="w-full bg-gray-900 text-white font-bold py-4 px-4 rounded-xl border border-gray-700 outline-none focus:ring-2 focus:ring-primary appearance-none shadow-lg text-sm tracking-wide"
        >
          <option value="All">🏆 SHOW ALL MATCHES</option>
          {allTeams.map(team => (
            // FIXED: Removed the word 'SCHEDULE' from the string here
            <option key={team} value={team}>🔍 {team}</option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
      </div>

      {displayedMatches.map((match) => {
        const isPlayed = match.isCompleted;

        return (
          <React.Fragment key={match.matchId}>
            
            {/* PLAYOFF CONTROLLER */}
            {match.matchId === 43 && adminKey && filterTeam === 'All' && (
              <div className="bg-gray-900 p-5 rounded-xl border border-gray-800 my-8 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent to-red-500"></div>
                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest text-center mb-4">Playoff Controller</h3>
                <div className="flex gap-3">
                  <button onClick={handleGeneratePlayoffs} disabled={isPlayoffStarted} className={`flex-1 py-3 rounded-lg font-bold text-sm ${isPlayoffStarted ? 'bg-gray-800 text-gray-600' : 'bg-primary text-dark hover:bg-emerald-400'}`}>Sync Bracket</button>
                  <button onClick={handleResetPlayoffs} disabled={isPlayoffStarted} className={`flex-1 py-3 rounded-lg font-bold text-sm ${isPlayoffStarted ? 'bg-gray-800 text-gray-600' : 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'}`}>Reset Bracket</button>
                </div>
              </div>
            )}

            {/* FIXTURE CARD */}
            <div className={`rounded-xl p-4 shadow-lg border relative transition-colors ${isPlayed ? 'bg-gray-900 border-gray-800 opacity-90' : 'bg-card border-gray-700'}`}>
              
              <div className="flex justify-between items-center mb-3 text-[10px] text-gray-400 font-bold tracking-widest uppercase">
                <span>Match #{match.matchId} &bull; {match.day}</span>
                <span>{match.time}</span>
              </div>

              <div className="flex justify-between items-center text-lg font-bold">
                <div className={`flex-1 text-center ${match.winner === match.homeTeam ? 'text-primary' : 'text-white'}`}>{match.homeTeam}</div>
                <div className="px-4 text-gray-500 font-black text-xl">
                  {isPlayed ? (
                    <span className={`text-white bg-black/50 px-3 py-1 rounded-md border shadow-inner ${match.winner === "Draw" ? 'border-blue-500/50' : 'border-gray-800'}`}>
                      {match.winner === "Draw" ? "BY" : `${match.homeScore} - ${match.awayScore}`}
                    </span>
                  ) : "VS"}
                </div>
                <div className={`flex-1 text-center ${match.winner === match.awayTeam ? 'text-primary' : 'text-white'}`}>{match.awayTeam}</div>
              </div>

              <div className="mt-3 flex justify-center">
                 <span className="text-[10px] uppercase tracking-widest bg-dark px-2 py-1 rounded text-accent font-semibold">{match.stage}</span>
              </div>

              {isPlayed && (
                <div className="mt-4 flex justify-center">
                  <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${match.winner === "Draw" ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
                    {match.winner === "Draw" ? "MATCH DRAWN (BY)" : `TEAM ${match.winner} WINNER`}
                  </span>
                </div>
              )}

              {adminKey && (
                <div className="flex gap-2 mt-4">
                  <button 
                    onClick={() => { setEditingMatch(match); const isBy = match.winner === "Draw"; setIsBy(isBy); setHomeScore(isPlayed && !isBy ? match.homeScore : ''); setAwayScore(isPlayed && !isBy ? match.awayScore : ''); }}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${isPlayed ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
                  >
                    {isPlayed ? 'Edit Score' : 'Log Score'}
                  </button>
                  {isPlayed && <button onClick={() => handleResetMatch(match._id)} className="bg-red-500/10 text-red-400 border border-red-500/20 px-4 py-2 rounded-lg text-sm font-bold">Reset</button>}
                </div>
              )}
            </div>
          </React.Fragment>
        );
      })}

      {/* ADMIN MODAL */}
      {editingMatch && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-end justify-center pb-safe">
          <div className="bg-card w-full max-w-md rounded-t-3xl p-6 border-t border-gray-700 shadow-2xl transition-transform">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{editingMatch.isCompleted ? 'Edit Result' : 'Log Result'}</h3>
              <button onClick={() => setEditingMatch(null)} className="text-gray-400 hover:text-white text-2xl">&times;</button>
            </div>

            <div className="mb-6 bg-gray-900/50 p-4 rounded-xl border border-gray-800">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm font-bold text-blue-400 uppercase tracking-wide">Mark as "BY" (Draw)</span>
                <input type="checkbox" className="w-6 h-6 rounded accent-blue-500" checked={isBy} onChange={(e) => setIsBy(e.target.checked)} />
              </label>
            </div>
            
            <form onSubmit={handleUpdateScore} className="space-y-6">
              <div className={`flex justify-between items-center gap-4 transition-opacity ${isBy ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                <div className="flex-1 text-center">
                  <label className="block text-sm text-gray-400 mb-2 font-semibold">{editingMatch.homeTeam}</label>
                  <input type="number" required={!isBy} min="0" max="10" className="w-full bg-dark text-white text-center text-3xl font-black py-4 rounded-xl focus:ring-2 focus:ring-primary outline-none border border-gray-800" value={homeScore} onChange={(e) => setHomeScore(e.target.value)} />
                </div>
                <div className="text-gray-600 font-black mt-6 text-2xl">-</div>
                <div className="flex-1 text-center">
                  <label className="block text-sm text-gray-400 mb-2 font-semibold">{editingMatch.awayTeam}</label>
                  <input type="number" required={!isBy} min="0" max="10" className="w-full bg-dark text-white text-center text-3xl font-black py-4 rounded-xl focus:ring-2 focus:ring-primary outline-none border border-gray-800" value={awayScore} onChange={(e) => setAwayScore(e.target.value)} />
                </div>
              </div>
              <button type="submit" className={`w-full font-black py-4 rounded-xl text-lg mt-4 ${isBy ? 'bg-blue-500 text-white' : 'bg-primary text-dark'}`}>{isBy ? 'SAVE AS BY' : 'SAVE MATCH'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}