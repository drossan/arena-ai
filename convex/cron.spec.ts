import { api } from "./_generated/api";

// Configure cron jobs for automatic battle start
export default {
  startScheduledBattles: {
    function: api.crons.startScheduledBattles,
    interval: "1 minute",
  },
} satisfies import("convex/server").CronSpec;
