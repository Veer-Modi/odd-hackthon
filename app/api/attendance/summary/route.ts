import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

function monthBounds(ym: string) {
  const [y, m] = ym.split('-').map(Number);
  if (!y || !m || m < 1 || m > 12) return null;
  const start = new Date(Date.UTC(y, m - 1, 1));
  const end = new Date(Date.UTC(y, m, 0));
  const toStr = (d: Date) => d.toISOString().slice(0, 10);
  return { start: toStr(start), end: toStr(end) };
}

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
    const month = searchParams.get('month');
    const roleParam = searchParams.get('role');
    let employeeId = searchParams.get('employeeId');

    if (!month) {
      return NextResponse.json({ error: 'month (YYYY-MM) is required' }, { status: 400 });
    }
    const bounds = monthBounds(month);
    if (!bounds) {
      return NextResponse.json({ error: 'Invalid month' }, { status: 400 });
    }

    if (payload.role !== 'admin') {
      const [employees]: any = await pool.execute(
        'SELECT id FROM employees WHERE user_id = ? LIMIT 1',
        [payload.userId]
      );
      if (employees.length === 0) {
        return NextResponse.json({ error: 'Employee record not found' }, { status: 404 });
      }
      employeeId = employees[0].id.toString();
    }

    const params: any[] = [bounds.start, bounds.end];
    let where = 'a.date BETWEEN ? AND ?';

    if (employeeId) {
      where += ' AND a.employee_id = ?';
      params.push(employeeId);
    }

    if (roleParam) {
      if (payload.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      where += ' AND u.role = ?';
      params.push(roleParam);
    }

    const [rows] = await pool.execute(
      `SELECT a.employee_id, e.first_name, e.last_name, e.department, u.role as user_role,
              COUNT(DISTINCT a.date) AS days_worked,
              SUM(a.working_hours) AS total_hours,
              SUM(CASE WHEN a.status IN ('Present','Late') THEN 1 ELSE 0 END) AS present_or_late_days,
              SUM(CASE WHEN a.shift_type = 'night' THEN 1 ELSE 0 END) AS night_days
       FROM attendance a
       JOIN employees e ON a.employee_id = e.id
       JOIN users u ON e.user_id = u.id
       WHERE ${where}
       GROUP BY a.employee_id, e.first_name, e.last_name, e.department, u.role
       ORDER BY e.first_name, e.last_name`,
      params
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Attendance summary GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
