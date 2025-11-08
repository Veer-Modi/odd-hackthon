import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

// GET payroll records
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
    const year = searchParams.get('year');
    const payrunId = searchParams.get('payrunId');
    const roleParam = searchParams.get('role');

    // Get employee ID if user is employee
    let employeeId = searchParams.get('employeeId');
    if (!employeeId && payload.role === 'employee') {
      const [employees]: any = await pool.execute(
        'SELECT id FROM employees WHERE user_id = ?',
        [payload.userId]
      );
      if (employees.length > 0) {
        employeeId = employees[0].id.toString();
      }
    }

    let query = `
      SELECT p.*, e.first_name, e.last_name, e.employee_code, e.department, e.designation,
             pr.status as payrun_status, pr.month as payrun_month, pr.year as payrun_year,
             u.role as user_role
      FROM payroll p
      JOIN employees e ON p.employee_id = e.id
      LEFT JOIN payruns pr ON p.payrun_id = pr.id
      LEFT JOIN users u ON e.user_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (employeeId) {
      query += ' AND p.employee_id = ?';
      params.push(employeeId);
    }

    if (month) {
      query += ' AND p.month = ?';
      params.push(month);
    }

    if (year) {
      query += ' AND p.year = ?';
      params.push(year);
    }

    if (payrunId) {
      query += ' AND p.payrun_id = ?';
      params.push(payrunId);
    }

    if (roleParam) {
      if (payload.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      query += ' AND u.role = ?';
      params.push(roleParam);
    }

    query += ' ORDER BY p.year DESC, p.month DESC, e.first_name ASC';

    const [payroll] = await pool.execute(query, params);

    return NextResponse.json(payroll);
  } catch (error) {
    console.error('Get payroll error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
