require('dotenv').config();
const mongoose = require('mongoose');
const Match = require('./models/Match');

const MONGO_URI = process.env.MONGO_URI;

const matchSchedule = [
  { matchId: 1, date: "9-Jun-26", day: "Tuesday", time: "12:30–2:00", homeTeam: "Ball Busters", awayTeam: "Wall", stage: "Group" },
  { matchId: 2, date: "9-Jun-26", day: "Tuesday", time: "12:30–2:00", homeTeam: "Spin Doctors", awayTeam: "Table Titans", stage: "Group" },
  { matchId: 3, date: "9-Jun-26", day: "Tuesday", time: "12:30–2:00", homeTeam: "Goal Patrol", awayTeam: "Lucky Bounce", stage: "Group" },
  { matchId: 4, date: "9-Jun-26", day: "Tuesday", time: "12:30–2:00", homeTeam: "Wall", awayTeam: "Table Titans", stage: "Group" },
  { matchId: 5, date: "9-Jun-26", day: "Tuesday", time: "4:15–5:10", homeTeam: "Ball Busters", awayTeam: "Lucky Bounce", stage: "Group" },
  { matchId: 6, date: "9-Jun-26", day: "Tuesday", time: "4:15–5:10", homeTeam: "Spin Doctors", awayTeam: "Aim Optional", stage: "Group" },
  { matchId: 7, date: "9-Jun-26", day: "Tuesday", time: "4:15–5:10", homeTeam: "Table Titans", awayTeam: "Lucky Bounce", stage: "Group" },
  { matchId: 8, date: "10-Jun-26", day: "Wednesday", time: "12:30–2:00", homeTeam: "Wall", awayTeam: "Aim Optional", stage: "Group" },
  { matchId: 9, date: "10-Jun-26", day: "Wednesday", time: "12:30–2:00", homeTeam: "Ball Busters", awayTeam: "Goal Patrol", stage: "Group" },
  { matchId: 10, date: "10-Jun-26", day: "Wednesday", time: "12:30–2:00", homeTeam: "Lucky Bounce", awayTeam: "Aim Optional", stage: "Group" },
  { matchId: 11, date: "10-Jun-26", day: "Wednesday", time: "4:15–5:10", homeTeam: "Table Titans", awayTeam: "Goal Patrol", stage: "Group" },
  { matchId: 12, date: "10-Jun-26", day: "Wednesday", time: "4:15–5:10", homeTeam: "Wall", awayTeam: "Spin Doctors", stage: "Group" },
  { matchId: 13, date: "10-Jun-26", day: "Wednesday", time: "4:15–5:10", homeTeam: "Aim Optional", awayTeam: "Goal Patrol", stage: "Group" },
  { matchId: 14, date: "10-Jun-26", day: "Wednesday", time: "4:15–5:10", homeTeam: "Lucky Bounce", awayTeam: "Spin Doctors", stage: "Group" },
  { matchId: 15, date: "11-Jun-26", day: "Thursday", time: "12:30–2:00", homeTeam: "Table Titans", awayTeam: "Ball Busters", stage: "Group" },
  { matchId: 16, date: "11-Jun-26", day: "Thursday", time: "12:30–2:00", homeTeam: "Goal Patrol", awayTeam: "Spin Doctors", stage: "Group" },
  { matchId: 17, date: "11-Jun-26", day: "Thursday", time: "12:30–2:00", homeTeam: "Aim Optional", awayTeam: "Ball Busters", stage: "Group" },
  { matchId: 18, date: "11-Jun-26", day: "Thursday", time: "4:15–5:10", homeTeam: "Lucky Bounce", awayTeam: "Wall", stage: "Group" },
  { matchId: 19, date: "11-Jun-26", day: "Thursday", time: "4:15–5:10", homeTeam: "Spin Doctors", awayTeam: "Ball Busters", stage: "Group" },
  { matchId: 20, date: "11-Jun-26", day: "Thursday", time: "4:15–5:10", homeTeam: "Goal Patrol", awayTeam: "Wall", stage: "Group" },
  { matchId: 21, date: "11-Jun-26", day: "Thursday", time: "4:15–5:10", homeTeam: "Aim Optional", awayTeam: "Table Titans", stage: "Group" },
  { matchId: 22, date: "12-Jun-26", day: "Friday", time: "12:30–2:00", homeTeam: "Wall", awayTeam: "Ball Busters", stage: "Group" },
  { matchId: 23, date: "12-Jun-26", day: "Friday", time: "12:30–2:00", homeTeam: "Table Titans", awayTeam: "Spin Doctors", stage: "Group" },
  { matchId: 24, date: "12-Jun-26", day: "Friday", time: "12:30–2:00", homeTeam: "Lucky Bounce", awayTeam: "Goal Patrol", stage: "Group" },
  { matchId: 25, date: "12-Jun-26", day: "Friday", time: "4:15–5:10", homeTeam: "Table Titans", awayTeam: "Wall", stage: "Group" },
  { matchId: 26, date: "12-Jun-26", day: "Friday", time: "4:15–5:10", homeTeam: "Lucky Bounce", awayTeam: "Ball Busters", stage: "Group" },
  { matchId: 27, date: "12-Jun-26", day: "Friday", time: "4:15–5:10", homeTeam: "Aim Optional", awayTeam: "Spin Doctors", stage: "Group" },
  { matchId: 28, date: "12-Jun-26", day: "Friday", time: "4:15–5:10", homeTeam: "Lucky Bounce", awayTeam: "Table Titans", stage: "Group" },
  { matchId: 29, date: "15-Jun-26", day: "Monday", time: "12:30–2:00", homeTeam: "Aim Optional", awayTeam: "Wall", stage: "Group" },
  { matchId: 30, date: "15-Jun-26", day: "Monday", time: "12:30–2:00", homeTeam: "Goal Patrol", awayTeam: "Ball Busters", stage: "Group" },
  { matchId: 31, date: "15-Jun-26", day: "Monday", time: "12:30–2:00", homeTeam: "Aim Optional", awayTeam: "Lucky Bounce", stage: "Group" },
  { matchId: 32, date: "15-Jun-26", day: "Monday", time: "4:15–5:10", homeTeam: "Goal Patrol", awayTeam: "Table Titans", stage: "Group" },
  { matchId: 33, date: "15-Jun-26", day: "Monday", time: "4:15–5:10", homeTeam: "Spin Doctors", awayTeam: "Wall", stage: "Group" },
  { matchId: 34, date: "15-Jun-26", day: "Monday", time: "4:15–5:10", homeTeam: "Goal Patrol", awayTeam: "Aim Optional", stage: "Group" },
  { matchId: 35, date: "15-Jun-26", day: "Monday", time: "4:15–5:10", homeTeam: "Spin Doctors", awayTeam: "Lucky Bounce", stage: "Group" },
  { matchId: 36, date: "16-Jun-26", day: "Tuesday", time: "12:30–2:00", homeTeam: "Ball Busters", awayTeam: "Table Titans", stage: "Group" },
  { matchId: 37, date: "16-Jun-26", day: "Tuesday", time: "12:30–2:00", homeTeam: "Spin Doctors", awayTeam: "Goal Patrol", stage: "Group" },
  { matchId: 38, date: "16-Jun-26", day: "Tuesday", time: "12:30–2:00", homeTeam: "Ball Busters", awayTeam: "Aim Optional", stage: "Group" },
  { matchId: 39, date: "16-Jun-26", day: "Tuesday", time: "4:15–5:10", homeTeam: "Wall", awayTeam: "Lucky Bounce", stage: "Group" },
  { matchId: 40, date: "16-Jun-26", day: "Tuesday", time: "4:15–5:10", homeTeam: "Ball Busters", awayTeam: "Spin Doctors", stage: "Group" },
  { matchId: 41, date: "16-Jun-26", day: "Tuesday", time: "4:15–5:10", homeTeam: "Wall", awayTeam: "Goal Patrol", stage: "Group" },
  { matchId: 42, date: "16-Jun-26", day: "Tuesday", time: "4:15–5:10", homeTeam: "Table Titans", awayTeam: "Aim Optional", stage: "Group" },
  { matchId: 43, date: "17-Jun-26", day: "Wednesday", time: "12:30–2:00", homeTeam: "Rank 1", awayTeam: "Rank 2", stage: "Qualifier 1" },
  { matchId: 44, date: "17-Jun-26", day: "Wednesday", time: "12:30–2:00", homeTeam: "Rank 3", awayTeam: "Rank 4", stage: "Eliminator 1" },
  { matchId: 45, date: "17-Jun-26", day: "Wednesday", time: "4:15–5:10", homeTeam: "Loser Q1", awayTeam: "Winner E1", stage: "Eliminator 2" },
  { matchId: 46, date: "17-Jun-26", day: "Wednesday", time: "4:15–5:10", homeTeam: "Winner Q1", awayTeam: "Winner E2", stage: "Final" }
];

const seedDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    await Match.deleteMany();
    await Match.insertMany(matchSchedule);
    console.log("Successfully seeded 46 matches into the database!");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding:", err);
    process.exit(1);
  }
};
seedDB();