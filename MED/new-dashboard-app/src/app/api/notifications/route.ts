import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Notification } from '@/lib/models';
import { getSession } from '@/lib/session';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const status = url.searchParams.get('status');
    const type = url.searchParams.get('type');

    const query: Record<string, unknown> = { userId: session.userId };
    
    if (status) {
      query.status = status;
    }
    
    if (type) {
      query.type = type;
    }

    console.log('Notifications API query:', JSON.stringify(query, null, 2));

    const notifications = await Notification
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    console.log(`Found ${notifications.length} notifications for query`);

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      type,
      title,
      message,
      data,
      priority,
      scheduledFor,
      expiresAt,
    } = body;

    await connectDB();

    const notification = new Notification({
      userId: session.userId,
      type,
      title,
      message,
      data,
      priority,
      scheduledFor: new Date(scheduledFor),
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    });

    await notification.save();

    return NextResponse.json(notification);
  } catch (error) {
    console.error('Failed to create notification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}