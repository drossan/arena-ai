import { query } from "./_generated/server";
import { v } from "convex/values";

export const listRooms = query({
  args: {},
  handler: async (ctx) => {
    // Get all rooms, sorted by start time
    const rooms = await ctx.db
      .query("rooms")
      .withIndex("by_startTime")
      .collect();

    // If no rooms, return empty array
    if (!rooms || rooms.length === 0) {
      return [];
    }

    // For each room, fetch participants and viewers count
    const roomsWithDetails = await Promise.all(
      rooms.map(async (room) => {
        // Fetch participants
        const participants = await ctx.db
          .query("participants")
          .withIndex("by_room", (q) => q.eq("roomId", room._id))
          .collect();

        // Fetch viewers
        const viewers = await ctx.db
          .query("viewers")
          .withIndex("by_room", (q) => q.eq("roomId", room._id))
          .collect();

        return {
          ...room,
          participants,
          viewerCount: viewers.length,
        };
      })
    );

    return roomsWithDetails;
  },
});

export const getRoom = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) return null;

    const participants = await ctx.db
      .query("participants")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();

    const viewers = await ctx.db
      .query("viewers")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();

    return {
      ...room,
      participants,
      messages,
      viewerCount: viewers.length,
    };
  },
});

export const getViewerCount = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const viewers = await ctx.db
      .query("viewers")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();

    return viewers.length;
  },
});
