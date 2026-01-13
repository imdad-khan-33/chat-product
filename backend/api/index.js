import "../src/config/env.js"; // Must be first!
import { app } from '../src/app.js'
import { initSocket } from "../src/sockets/index.js";
import conectDB from "../src/db/index.js"
import "../src/config/passport.config.js";

import { startSessionReminderJob } from '../src/jobs/sessionReminder.js';

// Initialize Socket.io
const io = initSocket(null);
startSessionReminderJob(io);

// Make `io` accessible in your routes/controllers
app.set("io", io);

// Connect to MongoDB
conectDB().catch((err) => {
    console.log("MongoDB connection err", err);
});

// Export for Vercel Serverless
export default app;
