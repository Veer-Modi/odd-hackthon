import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

// GET today's attendance status
export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get employee ID from user
    const [employees]: any = await pool.execute(
      'SELECT id FROM employees WHERE user_id = ?',
      [payload.userId]
    );

    if (employees.length === 0) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    const employeeId = employees[0].id;
    const today = new Date().toISOString().split('T')[0];

    // Get today's attendance
    const [attendance]: any = await pool.execute(
      `SELECT id, date, check_in, check_out, check_in_location, check_out_location, 
              status, working_hours, check_in_latitude, check_in_longitude,
              check_out_latitude, check_out_longitude, shift_type, scheduled_check_out, auto_checkout, auto_checkout_at
       FROM attendance 
       WHERE employee_id = ? AND date = ?`,
      [employeeId, today]
    );

    if (attendance.length === 0) {
      return NextResponse.json({
        hasAttendance: false,
        checkedIn: false,
        checkedOut: false,
      });
    }

    const record = attendance[0];
    return NextResponse.json({
      hasAttendance: true,
      checkedIn: !!record.check_in,
      checkedOut: !!record.check_out,
      checkInTime: record.check_in,
      checkOutTime: record.check_out,
      checkInLocation: record.check_in_location,
      checkOutLocation: record.check_out_location,
      status: record.status,
      workingHours: record.working_hours,
      checkInLatitude: record.check_in_latitude,
      checkInLongitude: record.check_in_longitude,
      checkOutLatitude: record.check_out_latitude,
      checkOutLongitude: record.check_out_longitude,
      shiftType: record.shift_type,
      scheduledCheckOut: record.scheduled_check_out,
      autoCheckout: !!record.auto_checkout,
      autoCheckoutAt: record.auto_checkout_at,
    });
  } catch (error) {
    console.error('Get today attendance error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
