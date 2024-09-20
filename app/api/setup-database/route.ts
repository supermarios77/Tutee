// app/api/setup-database/route.ts
import { NextResponse } from 'next/server';
import { setupDatabase } from '../../setup-database';
import logger from '@/lib/logger';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { reset } = await request.json();
    await setupDatabase(reset);
    logger.info('Database setup completed successfully');
    return NextResponse.json({ message: 'Database setup completed successfully' }, { status: 200 });
  } catch (error) {
    logger.error('Error setting up database:', error);
    return NextResponse.json({ error: 'Failed to set up database' }, { status: 500 });
  }
}