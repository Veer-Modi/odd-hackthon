import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

const APPROVER_ROLES = ['admin', 'hr'];

function parseDate(value: string | undefined | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

// PUT approve/reject night shift request
export async function PUT(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || !APPROVER_ROLES.includes(payload.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id, status, rejectionReason } = await request.json();
    if (!id || !['Approved', 'Rejected'].includes(status)) {
      return NextResponse.json({ error: 'id and valid status are required' }, { status: 400 });
    }

    const [rows]: any = await pool.execute(
      `SELECT nsr.*, e.user_id, e.first_name, e.last_name
       FROM night_shift_requests nsr
       JOIN employees e ON nsr.employee_id = e.id
       WHERE nsr.id = ? LIMIT 1`,
      [id]
    );
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Night shift request not found' }, { status: 404 });
    }

    await pool.execute(
      `UPDATE night_shift_requests
       SET status = ?, approved_by = ?, approved_at = NOW(), rejection_reason = ?
       WHERE id = ?`,
      [status, payload.userId, status === 'Rejected' ? (rejectionReason || null) : null, id]
    );

    const reqRow = rows[0];
    const message = status === 'Approved'
      ? `Your night shift request (${reqRow.start_date} to ${reqRow.end_date}) has been approved.`
      : `Your night shift request (${reqRow.start_date} to ${reqRow.end_date}) has been rejected.`;

    await pool.execute(
      `INSERT INTO notifications (user_id, title, message, type, action_url, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [reqRow.user_id, 'Night Shift Request Update', message, status === 'Approved' ? 'success' : 'error', '/night-shift']
    );

    return NextResponse.json({ message: `Request ${status.toLowerCase()}` });
  } catch (error) {
    console.error('Night shift PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET night shift requests
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    let employeeId = searchParams.get('employeeId');

    if (!APPROVER_ROLES.includes(payload.role)) {
      // Non-approvers can only view their own requests
      const [employees]: any = await pool.execute(
        'SELECT id FROM employees WHERE user_id = ? LIMIT 1',
        [payload.userId]
      );
      if (employees.length === 0) {
        return NextResponse.json({ error: 'Employee record not found' }, { status: 404 });
      }
      employeeId = employees[0].id.toString();
    }

    const conditions: string[] = [];
    const params: any[] = [];

    if (employeeId) {
      conditions.push('nsr.employee_id = ?');
      params.push(employeeId);
    }

    if (status) {
      conditions.push('nsr.status = ?');
      params.push(status);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const [rows] = await pool.execute(
      `SELECT nsr.*, e.first_name, e.last_name, e.employee_code, e.department,
              u.role as employee_role
       FROM night_shift_requests nsr
       JOIN employees e ON nsr.employee_id = e.id
       JOIN users u ON e.user_id = u.id
       ${whereClause}
       ORDER BY nsr.created_at DESC`,
      params
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Night shift GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST create night shift request
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

    const body = await request.json();
    const startDate = parseDate(body?.startDate);
    const endDate = parseDate(body?.endDate);
    const reason = typeof body?.reason === 'string' ? body.reason.trim() : null;

    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'Valid startDate and endDate are required' }, { status: 400 });
    }

    if (endDate < startDate) {
      return NextResponse.json({ error: 'End date must be after start date' }, { status: 400 });
    }

    const [employees]: any = await pool.execute(
      'SELECT id, first_name, last_name FROM employees WHERE user_id = ? LIMIT 1',
      [payload.userId]
    );

    if (employees.length === 0) {
      return NextResponse.json({ error: 'Employee record not found' }, { status: 404 });
    }

    const employee = employees[0];

    const [insertResult]: any = await pool.execute(
      `INSERT INTO night_shift_requests (employee_id, start_date, end_date, reason)
       VALUES (?, ?, ?, ?)`,
      [employee.id, body.startDate, body.endDate, reason || null]
    );

    const requestId = insertResult.insertId;

    // Notify HR/admin approvers
    const approverQuery = payload.role === 'hr'
      ? 'SELECT id FROM users WHERE role = ? AND is_active = TRUE'
      : 'SELECT id FROM users WHERE role IN (?, ?) AND is_active = TRUE';
    const approverParams = payload.role === 'hr' ? ['admin'] : ['hr', 'admin'];

    const [approvers]: any = await pool.execute(approverQuery, approverParams);

    for (const approver of approvers) {
      await pool.execute(
        `INSERT INTO notifications (user_id, title, message, type, action_url, created_at)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [
          approver.id,
          'Night Shift Approval Needed',
          `${employee.first_name} ${employee.last_name} has requested a night shift from ${body.startDate} to ${body.endDate}.`,
          'warning',
          '/night-shift',
        ]
      );
    }

    return NextResponse.json({
      message: 'Night shift request submitted',
      id: requestId,
    });
  } catch (error) {
    console.error('Night shift POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
