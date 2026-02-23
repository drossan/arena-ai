import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

// Simple hash function for passwords (in production, use bcrypt on the server)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Register a new user
export const register = mutation({
  args: {
    username: v.string(),
    password: v.string(),
    displayName: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if username already exists
    const existingUser = await ctx.db
      .query('users')
      .withIndex('by_username', (q) => q.eq('username', args.username))
      .first()

    if (existingUser) {
      throw new Error('El nombre de usuario ya existe')
    }

    // Hash the password
    const passwordHash = await hashPassword(args.password)

    // Create user
    const userId = await ctx.db.insert('users', {
      username: args.username,
      passwordHash,
      displayName: args.displayName,
      role: 'admin', // Default to admin for now
      createdAt: Date.now(),
      isActive: true,
    })

    return { success: true, userId }
  },
})

// Login validation
export const login = mutation({
  args: {
    username: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // Find user by username
    const user = await ctx.db
      .query('users')
      .withIndex('by_username', (q) => q.eq('username', args.username))
      .first()

    if (!user) {
      throw new Error('Usuario no encontrado')
    }

    if (!user.isActive) {
      throw new Error('Usuario desactivado')
    }

    // Verify password
    const passwordHash = await hashPassword(args.password)
    if (passwordHash !== user.passwordHash) {
      throw new Error('Contraseña incorrecta')
    }

    return {
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        displayName: user.displayName,
        role: user.role,
      },
    }
  },
})

// Get current user by ID
export const getUser = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId)
    if (!user) return null

    // Don't return password hash
    return {
      _id: user._id,
      username: user.username,
      displayName: user.displayName,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    }
  },
})

// Get all users (admin only)
export const listUsers = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query('users').collect()

    return users.map((user) => ({
      _id: user._id,
      username: user.username,
      displayName: user.displayName,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    }))
  },
})

// Create initial admin user (run once)
export const createInitialAdmin = mutation({
  args: {
    username: v.string(),
    password: v.string(),
    displayName: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if any users exist
    const existingUsers = await ctx.db.query('users').collect()
    if (existingUsers.length > 0) {
      throw new Error('Ya existe un usuario admin')
    }

    const passwordHash = await hashPassword(args.password)

    const userId = await ctx.db.insert('users', {
      username: args.username,
      passwordHash,
      displayName: args.displayName,
      role: 'admin',
      createdAt: Date.now(),
      isActive: true,
    })

    return { success: true, userId }
  },
})

// Update user
export const updateUser = mutation({
  args: {
    userId: v.id('users'),
    displayName: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    newPassword: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId)
    if (!user) {
      throw new Error('Usuario no encontrado')
    }

    const updates: any = {}

    if (args.displayName !== undefined) {
      updates.displayName = args.displayName
    }
    if (args.isActive !== undefined) {
      updates.isActive = args.isActive
    }
    if (args.newPassword !== undefined) {
      updates.passwordHash = await hashPassword(args.newPassword)
    }

    await ctx.db.patch(user._id, updates)

    return { success: true }
  },
})

// Delete user
export const deleteUser = mutation({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId)
    if (!user) {
      throw new Error('Usuario no encontrado')
    }

    await ctx.db.delete(user._id)

    return { success: true }
  },
})
