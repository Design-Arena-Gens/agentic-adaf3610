import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const now = Date.now();
    
    const updates: any = { ...data, updated_at: now };
    const block = db.updateBlock(params.id, updates);
    
    if (!block) {
      return NextResponse.json({ error: 'Block not found' }, { status: 404 });
    }
    
    // Update page's updated_at
    db.updatePage(block.page_id, { updated_at: now });
    
    return NextResponse.json(block);
  } catch (error) {
    console.error('Error updating block:', error);
    return NextResponse.json({ error: 'Failed to update block' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const block = db.getBlockById(params.id);
    
    if (!block) {
      return NextResponse.json({ error: 'Block not found' }, { status: 404 });
    }
    
    const pageId = block.page_id;
    const success = db.deleteBlock(params.id);
    
    if (success) {
      const now = Date.now();
      db.updatePage(pageId, { updated_at: now });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting block:', error);
    return NextResponse.json({ error: 'Failed to delete block' }, { status: 500 });
  }
}
