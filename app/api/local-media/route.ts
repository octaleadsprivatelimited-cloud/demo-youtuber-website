import { NextResponse } from 'next/server';

export async function GET() {
  return new NextResponse('Forbidden: Legacy local media API is disabled.', { status: 403 });
}

export async function POST() {
  return new NextResponse('Forbidden: Legacy local media API is disabled.', { status: 403 });
}
