const express = require('express');
const router = express.Router();
const Match = require('../models/Match');
const Team = require('../models/Team');

const ADMIN_PASSCODE = process.env.ADMIN_KEY;

// 1. Get All Matches
router.get('/matches', async (req, res) => {
  try {
    const matches = await Match.find().sort({ matchId: 1 });
    res.json(matches);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch fixtures' });
  }
});

// 2. Get Auto-Calculated Standings (WITH FORM GUIDE)
router.get('/standings', async (req, res) => {
  try {
    const matches = await Match.find({ isCompleted: true, stage: 'Group' });
    const teams = await Team.find();
    
    const standings = {};
    teams.forEach(t => {
      // Added 'form: []' array here
      standings[t.name] = { teamName: t.name, players: t.players, played: 0, wins: 0, losses: 0, draws: 0, points: 0, goalDiff: 0, form: [] };
    });

    matches.forEach(match => {
      const { homeTeam, awayTeam, winner, goalDifference } = match;
      if (standings[homeTeam] && standings[awayTeam]) {
        standings[homeTeam].played += 1;
        standings[awayTeam].played += 1;

        if (winner === "Draw") {
          standings[homeTeam].form.push('D');
          standings[awayTeam].form.push('D');
          standings[homeTeam].draws += 1;
          standings[awayTeam].draws += 1;
          standings[homeTeam].points += 1;
          standings[awayTeam].points += 1;
        } else if (winner === homeTeam) {
          standings[homeTeam].form.push('W');
          standings[awayTeam].form.push('L');
          standings[homeTeam].wins += 1;
          standings[awayTeam].losses += 1;
          standings[homeTeam].points += 2;
          standings[homeTeam].goalDiff += goalDifference;
          standings[awayTeam].goalDiff -= goalDifference;
        } else if (winner === awayTeam) {
          standings[awayTeam].form.push('W');
          standings[homeTeam].form.push('L');
          standings[awayTeam].wins += 1;
          standings[homeTeam].losses += 1;
          standings[awayTeam].points += 2;
          standings[awayTeam].goalDiff += goalDifference;
          standings[homeTeam].goalDiff -= goalDifference;
        }
      }
    });

    const sortedStandings = Object.values(standings).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.wins !== a.wins) return b.wins - a.wins;
      return b.goalDiff - a.goalDiff;
    });

    res.json(sortedStandings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to compile standings data' });
  }
});

// 3. Update Match Score & AUTO-ADVANCE PLAYOFFS (Admin)
router.post('/matches/:id', async (req, res) => {
  const { authKey, homeScore, awayScore, isDraw } = req.body;
  if (authKey !== ADMIN_PASSCODE) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ error: 'Match not found' });

    let winner, loser;

    if (isDraw) {
      match.homeScore = 0;
      match.awayScore = 0;
      match.winner = "Draw";
      match.goalDifference = 0;
      match.isCompleted = true;
      winner = "Draw";
    } else {
      const hScore = parseInt(homeScore, 10);
      const aScore = parseInt(awayScore, 10);
      
      winner = hScore === aScore ? "Draw" : (hScore > aScore ? match.homeTeam : match.awayTeam);
      loser = hScore === aScore ? "Draw" : (hScore > aScore ? match.awayTeam : match.homeTeam);

      match.homeScore = hScore;
      match.awayScore = aScore;
      match.winner = winner;
      match.goalDifference = Math.abs(hScore - aScore);
      match.isCompleted = true;
    }

    await match.save();

    if (winner !== "Draw") {
      if (match.stage === "Qualifier 1") {
        await Match.findOneAndUpdate({ matchId: 46 }, { homeTeam: winner });
        await Match.findOneAndUpdate({ matchId: 45 }, { homeTeam: loser });
      } else if (match.stage === "Eliminator 1") {
        await Match.findOneAndUpdate({ matchId: 45 }, { awayTeam: winner });
      } else if (match.stage === "Eliminator 2") {
        await Match.findOneAndUpdate({ matchId: 46 }, { awayTeam: winner });
      }
    }

    res.json({ success: true, match });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update match' });
  }
});

// 3b. RESET INDIVIDUAL MATCH TO UNPLAYED (Admin)
router.post('/matches/:id/reset', async (req, res) => {
  const { authKey } = req.body;
  if (authKey !== ADMIN_PASSCODE) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ error: 'Match not found' });

    match.homeScore = 0;
    match.awayScore = 0;
    match.winner = "";
    match.goalDifference = 0;
    match.isCompleted = false;

    await match.save();
    res.json({ success: true, match });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reset match' });
  }
});

// 4. Get All Teams
router.get('/teams', async (req, res) => {
  try {
    const teams = await Team.find();
    res.json(teams);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

// 5. RENAME TEAM (Admin)
router.post('/teams/rename', async (req, res) => {
  const { authKey, oldName, newName } = req.body;
  if (authKey !== ADMIN_PASSCODE) return res.status(401).json({ error: 'Unauthorized' });
  
  try {
    await Team.findOneAndUpdate({ name: oldName }, { name: newName });
    await Match.updateMany({ homeTeam: oldName }, { homeTeam: newName });
    await Match.updateMany({ awayTeam: oldName }, { awayTeam: newName });
    await Match.updateMany({ winner: oldName }, { winner: newName });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to rename team' });
  }
});

// 6. GENERATE PLAYOFF BRACKET (Admin)
router.post('/playoffs/generate', async (req, res) => {
  const { authKey } = req.body;
  if (authKey !== ADMIN_PASSCODE) return res.status(401).json({ error: 'Unauthorized' });

  try {
    // LOCK: Do not allow generation if Playoffs have already begun
    const match43 = await Match.findOne({ matchId: 43 });
    const match44 = await Match.findOne({ matchId: 44 });
    if (match43.isCompleted || match44.isCompleted) {
      return res.status(400).json({ error: 'Cannot sync: Playoff matches have already started.' });
    }

    const matches = await Match.find({ isCompleted: true, stage: 'Group' });
    const teams = await Team.find();
    
    const standings = {};
    teams.forEach(t => { standings[t.name] = { teamName: t.name, points: 0, wins: 0, goalDiff: 0 }; });

    matches.forEach(match => {
      const { homeTeam, awayTeam, winner, goalDifference } = match;
      if (standings[homeTeam] && standings[awayTeam]) {
        if (winner === "Draw") {
          standings[homeTeam].points += 1;
          standings[awayTeam].points += 1;
        } else {
          const isHomeWinner = winner === homeTeam;
          standings[homeTeam].wins += isHomeWinner ? 1 : 0;
          standings[awayTeam].wins += isHomeWinner ? 0 : 1;
          standings[homeTeam].points += isHomeWinner ? 2 : 0;
          standings[awayTeam].points += isHomeWinner ? 0 : 2;
          standings[homeTeam].goalDiff += isHomeWinner ? goalDifference : -goalDifference;
          standings[awayTeam].goalDiff += isHomeWinner ? -goalDifference : goalDifference;
        }
      }
    });

    const sortedStandings = Object.values(standings).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.wins !== a.wins) return b.wins - a.wins;
      return b.goalDiff - a.goalDiff;
    });

    await Match.findOneAndUpdate({ matchId: 43 }, { homeTeam: sortedStandings[0].teamName, awayTeam: sortedStandings[1].teamName });
    await Match.findOneAndUpdate({ matchId: 44 }, { homeTeam: sortedStandings[2].teamName, awayTeam: sortedStandings[3].teamName });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate playoff bracket' });
  }
});

// 7. RESET PLAYOFF BRACKET (Admin)
router.post('/playoffs/reset', async (req, res) => {
  const { authKey } = req.body;
  if (authKey !== ADMIN_PASSCODE) return res.status(401).json({ error: 'Unauthorized' });

  try {
    await Match.findOneAndUpdate({ matchId: 43 }, { homeTeam: "Rank 1", awayTeam: "Rank 2", homeScore: 0, awayScore: 0, winner: "", isCompleted: false });
    await Match.findOneAndUpdate({ matchId: 44 }, { homeTeam: "Rank 3", awayTeam: "Rank 4", homeScore: 0, awayScore: 0, winner: "", isCompleted: false });
    await Match.findOneAndUpdate({ matchId: 45 }, { homeTeam: "Loser Q1", awayTeam: "Winner E1", homeScore: 0, awayScore: 0, winner: "", isCompleted: false });
    await Match.findOneAndUpdate({ matchId: 46 }, { homeTeam: "Winner Q1", awayTeam: "Winner E2", homeScore: 0, awayScore: 0, winner: "", isCompleted: false });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reset playoffs' });
  }
});

module.exports = router;