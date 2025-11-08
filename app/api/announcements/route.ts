import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';
import { sendEmail } from '@/lib/email';

// GET list of recent announcements (by scanning notifications of type 'info'|'warning' with action_url '/announcements')
export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const [rows]: any = await pool.execute(
      `SELECT id, user_id, title, message, type, created_at
       FROM notifications
       WHERE action_url = '/announcements'
       ORDER BY created_at DESC
       LIMIT 50`
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Announcements GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST create a new announcement and fan-out to all active users via notifications and email
export async function POST(request: NextRequest) {
  const conn = await pool.getConnection();
  try {
    const token = getTokenFromRequest(request);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload || payload.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const title = String(body?.title ?? '').trim();
    const message = String(body?.message ?? '').trim();
    const type = ['info', 'warning', 'success', 'error'].includes(body?.type) ? body.type : 'info';

    if (!title || !message) {
      return NextResponse.json({ error: 'Title and message are required' }, { status: 400 });
    }

    await conn.beginTransaction();

    const [users]: any = await conn.execute(
      `SELECT id, email, email_notifications_enabled FROM users WHERE is_active = TRUE`
    );

    // Bulk insert notifications
    if (users.length > 0) {
      const values: any[] = [];
      const placeholders: string[] = [];
      for (const u of users) {
        placeholders.push('(?, ?, ?, ?, ?, NOW())');
        values.push(u.id, title, message, type, '/announcements');
      }
      await conn.execute(
        `INSERT INTO notifications (user_id, title, message, type, action_url, created_at) VALUES ${placeholders.join(',')}`,
        values
      );
    }

    await conn.commit();

    // Send emails (best-effort)
    for (const u of users) {
      try {
        if (u.email_notifications_enabled) {
          await sendEmail({
            to: u.email,
            subject: title,
            html: `<div style="font-family: Arial, sans-serif; line-height:1.5;">
                     <h2 style="margin:0 0 8px 0;">${title}</h2>
                     <p style="margin:0;">${message}</p>
                   </div>`,
          });
        }
      } catch {}
    }

    return NextResponse.json({ message: 'Announcement sent', recipients: users.length });
  } catch (error) {
    try { await conn.rollback(); } catch {}
    console.error('Announcements POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    conn.release();
  }
}
