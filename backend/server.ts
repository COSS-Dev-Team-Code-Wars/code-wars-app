// Register models first
import "./models/judge";
import "./models/admin";
import "./models/team";
import "./models/question";
import "./models/submission";
import "./models/testcase";

import express from 'express';
import bodyParser from 'body-parser';
import { connectDB, handleDisconnectDB } from './config/db';
import sampleRoutes from './routes/sampleRoute';
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
import { checkTokenMiddleware } from "./controllers/authController";

import './sockets/socket';
import { baseURL } from "./constants";

const cors = require("cors");
const app = express();

app.use(cors({
  origin : ["http://localhost:3000", 
            process.env.DEV_FRONTEND_URL || "",
            process.env.PROD_FRONTEND_URL || ""],
  credentials: true
}));

// app.use((req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader("Access-Control-Allow-Methods", ["POST","GET","PUT","DELETE"]);
//   res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Authorization, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, X-Authorization");
//   // res.setHeader("Access-Control-Allow-Authorization",true);
//   next();
// });

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();
// handleDisconnectDB();

// Middleware
app.use(bodyParser.json());

import healthCheckRoute from "./routes/health-check";
// Routes
app.use(healthCheckRoute);
app.use(loginRoute);
app.use(signupRoute);
app.use(checkIfLoggedInRoute);
app.use(adminRoutes);

// app.use(checkTokenMiddleware);

app.use(teamScoreRoutes);
app.use(teamDetailsRoute);
app.use(powerupRoutes);
app.use(submissionRoutes);
app.use(questionRoutes);
app.use(leaderboardRoutes);
app.use(testCaseRoutes);

//app.use('/api', sampleRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;