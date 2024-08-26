import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  try {
    const { userId, userName } = await req.json();

    if (!userId || !userName) {
      return NextResponse.json({ error: 'User ID and name are required' }, { status: 400 });
    }

    const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
    const apiSecret = process.env.STREAM_SECRET_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'Stream API key is missing' }, { status: 500 });
    }

    if (!apiSecret) {
      return NextResponse.json({ error: 'Stream API secret is missing' }, { status: 500 });
    }

    const payload = {
      user_id: userId,
      exp: Math.floor(Date.now() / 1000) + 60 * 60, // Token expires in 1 hour
    };

    const token = jwt.sign(payload, apiSecret);

    return NextResponse.json({ token });
  } catch (error) {
    console.error('Error generating token:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
