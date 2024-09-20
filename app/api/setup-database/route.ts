// app/api/setup-database/route.ts

import { NextResponse } from 'next/server';
import { setupDatabase } from '../../setup-database';

export async function GET() {
  try {
    await setupDatabase();
    return NextResponse.json({ message: 'Database setup completed successfully' }, { status: 200 });
  } catch (error) {
    logger.error('Error setting up database:', error);
    return NextResponse.json({ error: 'Failed to set up database' }, { status: 500 });
  }
}