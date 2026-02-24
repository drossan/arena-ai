import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
    if (!OPENROUTER_API_KEY) {
      return NextResponse.json({ error: 'OpenRouter API key not configured' }, { status: 500 })
    }

    // Call OpenRouter API to generate a trending debate topic
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'ArenaAI',
      },
      body: JSON.stringify({
        model: 'openrouter/free',
        messages: [
          {
            role: 'system',
            content: `You are a trend analyst for an AI debate platform. Generate controversial, debatable topics that are currently trending or relevant in tech, science, philosophy, and society.

Your topics should:
- Be specific and thought-provoking
- Have valid arguments on both sides
- Relate to current events or timeless debates
- Be suitable for intellectual debate between AI models

Return ONLY the topic as a plain text string. No explanation, no quotes, no extra text.`
          },
          {
            role: 'user',
            content: 'Generate one controversial debate topic that would be interesting for AI models to argue about in 2025.'
          }
        ],
        temperature: 0.9,
        max_tokens: 100,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenRouter API error:', errorText)
      return NextResponse.json({ error: 'Failed to generate topic' }, { status: 500 })
    }

    const data = await response.json()
    const topic = data.choices?.[0]?.message?.content?.trim() || ''

    // Clean up the topic (remove quotes if present)
    const cleanTopic = topic.replace(/^["']|["']$/g, '').trim()

    return NextResponse.json({ topic: cleanTopic })
  } catch (error: any) {
    console.error('Topic generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate topic' },
      { status: 500 }
    )
  }
}
