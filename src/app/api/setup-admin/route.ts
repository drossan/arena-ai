import { NextRequest, NextResponse } from 'next/server'
import { fetchMutation, fetchQuery } from 'convex/nextjs'
import { api } from '@/convex/_generated/api'

/**
 * Setup endpoint - Create first admin user
 * This endpoint only works if NO users exist in the database
 */
export async function POST(request: NextRequest) {
  try {
    // Check if any users exist
    const existingUsers = await fetchQuery(api.users.listUsers)

    if (existingUsers && existingUsers.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Setup solo disponible cuando no hay usuarios' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Validate input
    if (!body.username || !body.password || body.password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Usuario y contraseña requeridos (mínimo 6 caracteres)' },
        { status: 400 }
      )
    }

    // Create first admin
    const result = await fetchMutation(api.users.register, {
      username: body.username,
      password: body.password,
      displayName: body.displayName || body.username,
    })

    return NextResponse.json({
      success: true,
      message: 'Admin creado exitosamente',
      userId: result.userId,
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error al crear admin' },
      { status: 400 }
    )
  }
}
