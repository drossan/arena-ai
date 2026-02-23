import { api } from "./_generated/api";

// Configure cron jobs for automatic battle start
export default {
  startScheduledBattles: {
    function: api.crons.startScheduledBattles,
    interval: 60 * 1000, // Run every 60 seconds
  },
} satisfies import("convex/server").CronSpec;
