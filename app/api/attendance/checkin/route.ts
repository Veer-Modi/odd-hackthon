import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

const DAY_SHIFT_START = { hours: 9, minutes: 0 };
const DAY_SHIFT_END = { hours: 20, minutes: 0 };
const NIGHT_SHIFT_AUTO_CHECKOUT = { hours: 8, minutes: 0 };

type NightShiftRow = {
  start_date: string;
  end_date: string;
};

function toTime(now: Date): string {
  return now.toTimeString().split(' ')[0];
}

function combineDateTime(date: Date, hours: number, minutes: number) {
  const combined = new Date(date);
  combined.setHours(hours, minutes, 0, 0);
  return combined;
}

function toMysqlDate(date: Date) {
  return date.toISOString().split('T')[0];
}

function diffHours(start: Date, end: Date) {
  const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  return Math.max(0, parseFloat(diff.toFixed(2)));
}

async function getActiveNightShift(employeeId: number, today: string) {
  const [rows]: any = await pool.execute(
    `SELECT start_date, end_date
     FROM night_shift_requests
     WHERE employee_id = ? AND status = 'Approved' AND start_date <= ? AND end_date >= ?
     ORDER BY end_date DESC
     LIMIT 1`,
    [employeeId, today, today]
  );
  return rows.length > 0 ? (rows[0] as NightShiftRow) : null;
}

async function autoCheckoutIfNeeded(employeeId: number, now: Date) {
  const [rows]: any = await pool.execute(
    `SELECT id, date, check_in, shift_type, scheduled_check_out
     FROM attendance
     WHERE employee_id = ? AND check_in IS NOT NULL AND check_out IS NULL`,
    [employeeId]
  );

  for (const row of rows) {
    const baseDate = new Date(row.date + 'T00:00:00');
    const checkIn = row.check_in ? new Date(`${row.date}T${row.check_in}`) : null;
    let scheduledOut: Date | null = null;

    if (row.scheduled_check_out) {
      scheduledOut = new Date(row.scheduled_check_out);
    } else if (row.shift_type === 'night') {
      scheduledOut = combineDateTime(new Date(baseDate.getTime() + 24 * 60 * 60 * 1000), NIGHT_SHIFT_AUTO_CHECKOUT.hours, NIGHT_SHIFT_AUTO_CHECKOUT.minutes);
    } else {
      scheduledOut = combineDateTime(baseDate, DAY_SHIFT_END.hours, DAY_SHIFT_END.minutes);
    }

    if (!scheduledOut || !checkIn) {
      continue;
    }

    if (now >= scheduledOut) {
      const workingHours = diffHours(checkIn, scheduledOut);
      await pool.execute(
        `UPDATE attendance
         SET check_out = ?, working_hours = ?, auto_checkout = 1, auto_checkout_at = NOW()
         WHERE id = ?`,
        [toTime(scheduledOut), workingHours, row.id]
      );
    }
  }
}

// POST check-in with GPS location
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
    const today = toMysqlDate(now);
    const currentTime = toTime(now);

    // Get employee ID from user
    const [employees]: any = await pool.execute(
      'SELECT id FROM employees WHERE user_id = ?',
      [payload.userId]
    );

    if (employees.length === 0) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    const employeeId = employees[0].id;

    await autoCheckoutIfNeeded(employeeId, now);

    const activeNightShift = await getActiveNightShift(employeeId, today);
    const shiftType = activeNightShift ? 'night' : 'day';

    if (!activeNightShift) {
      const shiftStart = combineDateTime(new Date(), DAY_SHIFT_START.hours, DAY_SHIFT_START.minutes);
      const shiftEnd = combineDateTime(new Date(), DAY_SHIFT_END.hours, DAY_SHIFT_END.minutes);
      if (now < shiftStart || now > shiftEnd) {
        return NextResponse.json(
          {
            error: 'Check-in allowed between 09:00 and 20:00. Request a night shift for extended hours.',
          },
          { status: 400 }
        );
      }
    }

    // Check if attendance already exists for today
    const [existing]: any = await pool.execute(
      'SELECT id, check_in FROM attendance WHERE employee_id = ? AND date = ?',
      [employeeId, today]
    );

    // Determine status (Late if after 9:15 AM for day shift)
    let status = 'Present';
    if (shiftType === 'day') {
      const lateThreshold = combineDateTime(new Date(), 9, 15);
      status = now > lateThreshold ? 'Late' : 'Present';
    }

    const scheduledCheckoutDateTime = shiftType === 'night'
      ? combineDateTime(new Date(now.getTime() + 24 * 60 * 60 * 1000), NIGHT_SHIFT_AUTO_CHECKOUT.hours, NIGHT_SHIFT_AUTO_CHECKOUT.minutes)
      : combineDateTime(new Date(), DAY_SHIFT_END.hours, DAY_SHIFT_END.minutes);

    if (existing.length > 0) {
      if (existing[0].check_in) {
        return NextResponse.json({ error: 'Already checked in today' }, { status: 400 });
      }

      await pool.execute(
        `UPDATE attendance 
         SET check_in = ?, 
             check_in_latitude = ?, 
             check_in_longitude = ?, 
             check_in_location = ?,
             status = ?,
             shift_type = ?,
             scheduled_check_out = ?,
             auto_checkout = 0,
             auto_checkout_at = NULL
         WHERE employee_id = ? AND date = ?`,
        [
          currentTime,
          latitude || null,
          longitude || null,
          location || null,
          status,
          shiftType,
          scheduledCheckoutDateTime.toISOString().slice(0, 19).replace('T', ' '),
          employeeId,
          today,
        ]
      );
    } else {
      await pool.execute(
        `INSERT INTO attendance (employee_id, date, check_in, check_in_latitude, check_in_longitude, check_in_location, status, shift_type, scheduled_check_out, auto_checkout)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
        [
          employeeId,
          today,
          currentTime,
          latitude || null,
          longitude || null,
          location || null,
          status,
          shiftType,
          scheduledCheckoutDateTime.toISOString().slice(0, 19).replace('T', ' '),
        ]
      );
    }

    return NextResponse.json({
      message: 'Checked in successfully',
      checkInTime: currentTime,
      status,
      shiftType,
      scheduledCheckout: toTime(scheduledCheckoutDateTime),
    });
  } catch (error) {
    console.error('Check-in error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
