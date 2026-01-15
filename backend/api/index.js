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
