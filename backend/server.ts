// Register models first
import "./models/judge";
import "./models/admin";
import "./models/team";
import "./models/question";
import "./models/submission";
import "./models/testcase";

import express from 'express';
import bodyParser from 'body-parser';
import { connectDB } from './config/db';
import loginRoute from './routes/loginRoute';
import signupRoute from './routes/signupRoute';
import checkIfLoggedInRoute from './routes/checkIfLoggedInRoute';
import teamScoreRoutes from './routes/teamScoreRoutes';
import powerupRoutes from './routes/powerupRoute'
import submissionRoutes from './routes/submissionRoutes';
import adminRoutes from './routes/adminRoutes';
import questionRoutes from './routes/questionRoutes';
import teamDetailsRoute from './routes/teamDetailsRoute';
import leaderboardRoutes from './routes/leaderboardRoutes';
import testCaseRoutes from './routes/testCaseRoutes';
import healthCheckRoute from "./routes/health-check";
import { createProxyMiddleware } from "http-proxy-middleware";

import './sockets/socket';

const cors = require("cors");
const app = express();

app.use(cors({
  origin: ["*"],
  methods: ["GET", "POST", "PUT", "DELETE"]
}));

app.use((_, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", ["POST","GET","PUT","DELETE"]);
  res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Authorization, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, X-Authorization");
  next();
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();
// handleDisconnectDB();


// Middleware
app.use(bodyParser.json());
// app.use("/socket.io/*", createProxyMiddleware({
//   target: 'http://localhost:8000',
//   ws: true,
//   changeOrigin: true
// }));

// Routes
app.use(healthCheckRoute);
app.use(loginRoute);
app.use(signupRoute);
app.use(checkIfLoggedInRoute);
app.use(adminRoutes);

app.use(teamScoreRoutes);
app.use(teamDetailsRoute);
app.use(powerupRoutes);
app.use(submissionRoutes);
app.use(questionRoutes);
app.use(leaderboardRoutes);
app.use(testCaseRoutes);

//app.use('/api', sampleRoutes);

// Start the server
//@ Increment this value everytime you restart nginx via commit
//@ Nginx Restart Commits: 9
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;