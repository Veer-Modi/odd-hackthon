import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

function toTimeString(date: Date) {
  return date.toTimeString().split(' ')[0];
}

function diffHours(start: Date, end: Date) {
  const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  return Math.max(0, parseFloat(diff.toFixed(2)));
}

// POST check-out with GPS location
export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { latitude, longitude, location } = await request.json();
    const now = new Date();
    const nowTime = toTimeString(now);

    // Get employee ID from user
    const [employees]: any = await pool.execute(
      'SELECT id FROM employees WHERE user_id = ?',
      [payload.userId]
    );

    if (employees.length === 0) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    const employeeId = employees[0].id;

    // Find the most recent open attendance record (supports night shifts)
    const [existing]: any = await pool.execute(
      `SELECT id, date, check_in, check_out, shift_type, scheduled_check_out
       FROM attendance
       WHERE employee_id = ? AND check_in IS NOT NULL AND check_out IS NULL
       ORDER BY date DESC
       LIMIT 1`,
      [employeeId]
    );

    if (existing.length === 0) {
      return NextResponse.json({ error: 'Please check in first' }, { status: 400 });
    }

    const record = existing[0];
    const checkInDateTime = new Date(`${record.date}T${record.check_in}`);

    if (Number.isNaN(checkInDateTime.getTime())) {
      return NextResponse.json({ error: 'Invalid check-in time recorded' }, { status: 500 });
    }

    const workingHours = diffHours(checkInDateTime, now);

    await pool.execute(
      `UPDATE attendance
       SET check_out = ?,
           check_out_latitude = ?,
           check_out_longitude = ?,
           check_out_location = ?,
           working_hours = ?,
           auto_checkout = 0,
           auto_checkout_at = NULL,
           scheduled_check_out = IFNULL(scheduled_check_out, ?)
       WHERE id = ?`,
      [
        nowTime,
        latitude || null,
        longitude || null,
        location || null,
        workingHours,
        record.scheduled_check_out || `${record.date}T${nowTime}`,
        record.id,
      ]
    );

    return NextResponse.json({
      message: 'Checked out successfully',
      checkOutTime: nowTime,
      workingHours,
    });
  } catch (error) {
    console.error('Check-out error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
