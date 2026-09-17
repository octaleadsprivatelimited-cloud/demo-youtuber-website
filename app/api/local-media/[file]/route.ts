import { NextResponse } from 'next/server';

export async function GET() {
  return new NextResponse('Forbidden: Legacy local media API is disabled.', { status: 403 });
}
