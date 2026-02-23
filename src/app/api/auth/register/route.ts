import { NextRequest, NextResponse } from 'next/server'
import { fetchMutation } from 'convex/nextjs'
import { api } from '@/convex/_generated/api'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const result = await fetchMutation(api.users.register, {
      username: body.username,
      password: body.password,
      displayName: body.displayName || body.username,
    })

    return NextResponse.json({ success: true, userId: result.userId })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error al registrar usuario' },
      { status: 400 }
    )
  }
}
