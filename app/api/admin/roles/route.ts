import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

// GET: List current HR/Payroll Officers
export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const [rows] = await pool.execute(
      `SELECT u.id as user_id, u.email, u.role, e.id as employee_id, e.first_name, e.last_name, e.employee_code, e.department
       FROM users u
       LEFT JOIN employees e ON e.user_id = u.id
       WHERE u.role IN ('hr','payroll_officer')
       ORDER BY u.role, e.first_name, e.last_name`
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Admin roles GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Assign or reassign a role
// body: { role: 'hr'|'payroll_officer', employeeId: number, department?: string, demotePrevious?: boolean }
export async function POST(request: NextRequest) {
  const conn = await pool.getConnection();
  try {
    const token = getTokenFromRequest(request);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const role = body?.role as 'hr' | 'payroll_officer';
    const employeeId = Number(body?.employeeId);
    const department = body?.department as string | undefined;
    const demotePrevious = Boolean(body?.demotePrevious);

    if (!['hr', 'payroll_officer'].includes(role) || !employeeId) {
      return NextResponse.json({ error: 'role and employeeId are required' }, { status: 400 });
    }

    await conn.beginTransaction();

    // get target user's id
    const [empRows]: any = await conn.execute(
      'SELECT user_id FROM employees WHERE id = ? LIMIT 1',
      [employeeId]
    );
    if (empRows.length === 0 || !empRows[0].user_id) {
      await conn.rollback();
      return NextResponse.json({ error: 'Employee not found or not linked to a user' }, { status: 404 });
    }

    const targetUserId = empRows[0].user_id as number;

    if (demotePrevious) {
      // Demote existing holders of this role to employee
      await conn.execute(
        `UPDATE users SET role = 'employee' WHERE role = ?`,
        [role]
      );
    }

    // Promote target user
    await conn.execute(
      `UPDATE users SET role = ? WHERE id = ?`,
      [role, targetUserId]
    );

    // Optionally move department
    if (typeof department === 'string' && department.trim().length > 0) {
      await conn.execute(
        `UPDATE employees SET department = ? WHERE id = ?`,
        [department.trim(), employeeId]
      );
    }

    await conn.commit();

    return NextResponse.json({ message: 'Role assignment updated' });
  } catch (error) {
    try { await conn.rollback(); } catch {}
    console.error('Admin roles POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    conn.release();
  }
}
