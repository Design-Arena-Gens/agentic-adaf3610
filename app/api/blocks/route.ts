import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { nanoid } from 'nanoid';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const pageId = searchParams.get('pageId');
    
    if (!pageId) {
      return NextResponse.json({ error: 'pageId is required' }, { status: 400 });
    }
    
    const blocks = db.getBlocksByPageId(pageId);
    return NextResponse.json(blocks);
  } catch (error) {
    console.error('Error fetching blocks:', error);
    return NextResponse.json({ error: 'Failed to fetch blocks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { page_id, type, content, position, properties } = await request.json();
    const id = nanoid();
    const now = Date.now();
    
    const block = db.createBlock({
      id,
      page_id,
      type,
      content: content || '',
      position,
      properties: properties || {},
      created_at: now,
      updated_at: now
    });
    
    // Update page's updated_at
    db.updatePage(page_id, { updated_at: now });
    
    return NextResponse.json(block);
  } catch (error) {
    console.error('Error creating block:', error);
    return NextResponse.json({ error: 'Failed to create block' }, { status: 500 });
  }
}
