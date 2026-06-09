require('dotenv').config();
const mongoose = require('mongoose');
const Team = require('./models/Team');

const MONGO_URI = process.env.MONGO_URI;

const TEAMS = [
  { name: "Ball Busters", players: "Pankaj & Rahil", accent: "from-blue-500/20 to-blue-900/20", border: "border-blue-500/50" },
  { name: "Spin Doctors", players: "Shadab & Ahmad", accent: "from-purple-500/20 to-purple-900/20", border: "border-purple-500/50" },
  { name: "Goal Patrol", players: "Vaibhav & Ankush", accent: "from-red-500/20 to-red-900/20", border: "border-red-500/50" },
  { name: "Aim Optional", players: "Madhur & Mustafa", accent: "from-yellow-500/20 to-yellow-900/20", border: "border-yellow-500/50" },
  { name: "Lucky Bounce", players: "Ashish & Sumit", accent: "from-green-500/20 to-green-900/20", border: "border-green-500/50" },
  { name: "Table Titans", players: "Jay & Kshitij", accent: "from-orange-500/20 to-orange-900/20", border: "border-orange-500/50" },
  { name: "Wall", players: "Mohit & Deepak", accent: "from-slate-500/20 to-slate-900/20", border: "border-slate-500/50" }
];

const seedDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    await Team.deleteMany(); // Clear old teams
    await Team.insertMany(TEAMS);
    console.log("Successfully seeded Teams into the database!");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding teams:", err);
    process.exit(1);
  }
};
seedDB();