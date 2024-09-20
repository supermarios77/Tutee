import { NextResponse } from 'next/server'
import { StreamChat } from 'stream-chat'

export async function POST(request: Request) {
  try {
    const { userId, userName } = await request.json()

    if (!userId || !userName) {
      return NextResponse.json({ error: 'User ID and name are required' }, { status: 400 })
    }

    const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY
    const apiSecret = process.env.STREAM_SECRET_KEY

    if (!apiKey || !apiSecret) {
      logger.error('Stream API key or secret is not defined')
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }

    const serverClient = StreamChat.getInstance(apiKey, apiSecret)
    const token = serverClient.createToken(userId)

    return NextResponse.json({ token })
  } catch (error) {
    logger.error('Error generating token:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
