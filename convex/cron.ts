import { mutation } from "./_generated/server";

// Cron mutation to automatically start scheduled battles
// This will be called every minute by Convex cron
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
