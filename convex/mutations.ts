import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Simple admin password (in production, use proper auth)
const ADMIN_PASSWORD = "arena2026";

export const createRoom = mutation({
  args: {
    topic: v.string(),
    modelA: v.string(),
    modelB: v.string(),
    startTime: v.number(), // Unix timestamp
    createdBy: v.optional(v.id("users")), // Admin user who created the room
  },
  handler: async (ctx, args) => {
    // Verify user is admin if createdBy is provided
    if (args.createdBy) {
      const user = await ctx.db.get(args.createdBy)
      if (!user || user.role !== "admin") {
        throw new Error("Only admins can create rooms")
      }
    }

    const roomId = await ctx.db.insert("rooms", {
      topic: args.topic,
      modelA: args.modelA,
      modelB: args.modelB,
      startTime: args.startTime,
      status: "scheduled",
      createdBy: args.createdBy,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Create participant A
    await ctx.db.insert("participants", {
      roomId,
      modelId: args.modelA,
      modelName: getModelName(args.modelA),
      color: getModelColor(args.modelA),
      hp: 100,
      maxHp: 100,
      side: "A",
    });

    // Create participant B
    await ctx.db.insert("participants", {
      roomId,
      modelId: args.modelB,
      modelName: getModelName(args.modelB),
      color: getModelColor(args.modelB),
      hp: 100,
      maxHp: 100,
      side: "B",
    });

    return roomId;
  },
});

export const joinRoom = mutation({
  args: {
    roomId: v.id("rooms"),
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if viewer already exists in any room
    const existing = await ctx.db
      .query("viewers")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (existing) {
      // Leave previous room
      await ctx.db.delete(existing._id);
    }

    // Join new room
    await ctx.db.insert("viewers", {
      roomId: args.roomId,
      sessionId: args.sessionId,
      joinedAt: Date.now(),
    });

    return args.roomId;
  },
});

export const leaveRoom = mutation({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const viewer = await ctx.db
      .query("viewers")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (viewer) {
      await ctx.db.delete(viewer._id);
    }
  },
});

export const startBattle = mutation({
  args: {
    roomId: v.id("rooms"),
    adminPassword: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.adminPassword !== ADMIN_PASSWORD) {
      throw new Error("Invalid admin password");
    }

    const room = await ctx.db.get(args.roomId);
    if (!room) throw new Error("Room not found");

    await ctx.db.patch(args.roomId, {
      status: "debating",
      currentRound: 1,
      currentTurn: 1,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Helper functions
function getModelName(modelId: string): string {
  const models: Record<string, string> = {
    "openai/gpt-4o": "GPT-4o",
    "anthropic/claude-3.5-sonnet": "Claude 3.5 Sonnet",
    "google/gemini-pro": "Gemini Pro",
    "meta-llama/llama-3-70b": "Llama 3",
    "mistralai/mistral-large": "Mistral",
  };
  return models[modelId] || modelId;
}

function getModelColor(modelId: string): string {
  const colors: Record<string, string> = {
    "openai/gpt-4o": "#00f0ff",
    "anthropic/claude-3.5-sonnet": "#b026ff",
    "google/gemini-pro": "#39ff14",
    "meta-llama/llama-3-70b": "#ff6b35",
    "mistralai/mistral-large": "#f0f0f0",
  };
  return colors[modelId] || "#888888";
}
