import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';
import { getDaysInMonth, normalizeMonthYear } from '@/lib/payroll';

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
    const employeeId = searchParams.get('employeeId');
    const monthParam = searchParams.get('month');
    const yearParam = searchParams.get('year');

    const { month, year } = normalizeMonthYear(monthParam, yearParam);

    let query = `
      SELECT p.*, e.first_name, e.last_name, e.employee_code, e.department,
             CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
             (p.deductions + IFNULL(p.penalty, 0)) AS total_deductions
      FROM payroll p
      JOIN employees e ON p.employee_id = e.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (employeeId) {
      query += ' AND p.employee_id = ?';
      params.push(employeeId);
    }

    if (month !== undefined) {
      query += ' AND p.month = ?';
      params.push(month);
    }

    if (year !== undefined) {
      query += ' AND p.year = ?';
      params.push(year);
    }

    query += ' ORDER BY p.year DESC, p.month DESC';

    const [payrolls] = await pool.execute(query, params);

    return NextResponse.json(payrolls);
  } catch (error) {
    console.error('Get payroll error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST generate payroll
export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || !['admin', 'payroll_officer'].includes(payload.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const employeeId = body?.employeeId;
    const { month, year } = normalizeMonthYear(body?.month, body?.year);

    if (!employeeId) {
      return NextResponse.json({ error: 'Employee ID is required' }, { status: 400 });
    }

    if (!month || !year) {
      return NextResponse.json({ error: 'Month and year are required' }, { status: 400 });
    }

    // Get employee details
    const [employees]: any = await pool.execute(
      'SELECT * FROM employees WHERE id = ? AND status = "active"',
      [employeeId]
    );

    if (employees.length === 0) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    const employee = employees[0];

    // Get attendance for the month
    const [attendance]: any = await pool.execute(
      `SELECT 
        SUM(CASE WHEN status IN ('Present', 'Late', 'Half Day') THEN 1 ELSE 0 END) as present_days,
        SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) as absent_days
       FROM attendance
       WHERE employee_id = ? AND MONTH(date) = ? AND YEAR(date) = ?`,
      [employeeId, month, year]
    );

    // Get approved leaves for the month
    const [leaves]: any = await pool.execute(
      `SELECT COALESCE(SUM(total_days), 0) as leave_days
       FROM leave_requests
       WHERE employee_id = ? AND status = 'Approved'
       AND MONTH(start_date) = ? AND YEAR(start_date) = ?`,
      [employeeId, month, year]
    );

    const workingDays = getDaysInMonth(month, year);
    const presentDays = attendance[0].present_days || 0;
    const absentDays = attendance[0].absent_days || 0;
    const leaveDays = leaves[0].leave_days || 0;

    const basicSalary = parseFloat(employee.basic_salary);
    const allowances = parseFloat(employee.allowances);
    const perDaySalary = (basicSalary + allowances) / workingDays;
    
    // Calculate deductions for absent days (leaves are paid)
    const deductions = perDaySalary * absentDays;
    
    const grossSalary = basicSalary + allowances;
    const netSalary = Math.max(0, grossSalary - deductions);

    // Check if payroll already exists
    const [existing]: any = await pool.execute(
      'SELECT id FROM payroll WHERE employee_id = ? AND month = ? AND year = ?',
      [employeeId, month, year]
    );

    if (existing.length > 0) {
      // Update existing payroll
      await pool.execute(
        `UPDATE payroll 
         SET basic_salary = ?, allowances = ?, deductions = ?, 
             gross_salary = ?, net_salary = ?, working_days = ?,
             present_days = ?, absent_days = ?, leave_days = ?,
             generated_by = ?
         WHERE id = ?`,
        [basicSalary, allowances, deductions, grossSalary, netSalary,
         workingDays, presentDays, absentDays, leaveDays, payload.userId, existing[0].id]
      );
    } else {
      // Create new payroll
      await pool.execute(
        `INSERT INTO payroll (
          employee_id, month, year, basic_salary, allowances, deductions,
          gross_salary, net_salary, working_days, present_days, absent_days,
          leave_days, generated_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [employeeId, month, year, basicSalary, allowances, deductions,
         grossSalary, netSalary, workingDays, presentDays, absentDays,
         leaveDays, payload.userId]
      );
    }

    return NextResponse.json({
      message: 'Payroll generated successfully',
      payroll: {
        basicSalary,
        allowances,
        deductions,
        grossSalary,
        netSalary,
        workingDays,
        presentDays,
        absentDays,
        leaveDays,
      }
    });
  } catch (error) {
    console.error('Generate payroll error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
