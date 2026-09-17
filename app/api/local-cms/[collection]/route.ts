import { NextResponse } from 'next/server';

export async function GET() {
  return new NextResponse('Forbidden: Legacy local CMS API is disabled.', { status: 403 });
}

export async function PUT() {
  return new NextResponse('Forbidden: Legacy local CMS API is disabled.', { status: 403 });
}

export async function POST() {
  return new NextResponse('Forbidden: Legacy local CMS API is disabled.', { status: 403 });
}

export async function DELETE() {
  return new NextResponse('Forbidden: Legacy local CMS API is disabled.', { status: 403 });
}
