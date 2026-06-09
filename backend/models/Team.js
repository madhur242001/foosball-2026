const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  players: { type: String, required: true },
  accent: { type: String, required: true },
  border: { type: String, required: true }
});

module.exports = mongoose.model('Team', TeamSchema);