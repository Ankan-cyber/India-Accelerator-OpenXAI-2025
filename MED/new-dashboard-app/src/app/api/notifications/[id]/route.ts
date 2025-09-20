import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Notification } from '@/lib/models';
import { getSession } from '@/lib/session';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await connectDB();

    const notification = await Notification.findOneAndDelete({
      _id: id,
      userId: session.userId,
    });

    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete notification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}