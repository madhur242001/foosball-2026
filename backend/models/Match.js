const mongoose = require('mongoose');

const MatchSchema = new mongoose.Schema({
  matchId: { type: Number, required: true, unique: true },
  date: { type: String, required: true },
  day: { type: String, required: true },
  time: { type: String, required: true },
  homeTeam: { type: String, required: true },
  awayTeam: { type: String, required: true },
  stage: { type: String, default: 'Group' },
  
  isCompleted: { type: Boolean, default: false },
  homeScore: { type: Number, default: 0 },
  awayScore: { type: Number, default: 0 },
  winner: { type: String, default: "" },
  goalDifference: { type: Number, default: 0 }
});

module.exports = mongoose.model('Match', MatchSchema);