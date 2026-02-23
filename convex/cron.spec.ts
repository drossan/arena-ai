import { api } from "./_generated/api";

export default {
  startScheduledBattles: {
    function: api.crons.startScheduledBattles,
    interval: "* * * * * *", // Every minute using cron syntax
  },
} satisfies import("convex/server").CronSpec;
