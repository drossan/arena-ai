import { cronJobs } from "./_generated/server";

// Cron job to automatically start scheduled battles every minute
cronJobs("startScheduledBattles", {
  interval: 60 * 1000, // Run every 60 seconds
});
