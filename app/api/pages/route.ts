import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { nanoid } from 'nanoid';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const pages = db.getAllPages();
    return NextResponse.json(pages);
  } catch (error) {
    console.error('Error fetching pages:', error);
    return NextResponse.json({ error: 'Failed to fetch pages' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title } = await request.json();
    const id = nanoid();
    const now = Date.now();
    
    const page = db.createPage({
      id,
      title: title || 'Untitled',
      created_at: now,
      updated_at: now
    });
    
    return NextResponse.json(page);
  } catch (error) {
    console.error('Error creating page:', error);
    return NextResponse.json({ error: 'Failed to create page' }, { status: 500 });
  }
}
