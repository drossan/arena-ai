import { cronMutations, mutation } from "./_generated/server";

// Cron job to automatically start scheduled battles every minute
cronMutations("startScheduledBattles", {
  interval: 60 * 1000, // Run every 60 seconds
  args: {},
});

// Cron mutation
export const startScheduledBattles = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // Find all scheduled rooms that should start
    const scheduledRooms = await ctx.db
      .query("rooms")
      .withIndex("by_status", (q) => q.eq("status", "scheduled"))
      .collect();

    const roomsToStart = scheduledRooms.filter(
      (room) => room.startTime <= now
    );

    // Start each room
    for (const room of roomsToStart) {
      await ctx.db.patch(room._id, {
        status: "debating",
        currentRound: 1,
        currentTurn: 1,
        updatedAt: now,
      });
    }

    return { started: roomsToStart.length };
  },
});
