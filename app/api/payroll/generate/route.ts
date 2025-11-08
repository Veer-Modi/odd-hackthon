import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';
import { getDaysInMonth, normalizeMonthYear } from '@/lib/payroll';

// POST generate payroll for a month
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
    const { month, year } = normalizeMonthYear(body?.month, body?.year);

    if (!month || !year) {
      return NextResponse.json({ error: 'Month and year are required' }, { status: 400 });
    }

    // Check if payrun already exists for this month/year
    const [existingPayrun]: any = await pool.execute(
      'SELECT id FROM payruns WHERE month = ? AND year = ?',
      [month, year]
    );

    if (existingPayrun.length > 0) {
      return NextResponse.json(
        { error: 'Payrun already exists for this month' },
        { status: 400 }
      );
    }

    // Get system settings
    const [settings]: any = await pool.execute(
      'SELECT setting_key, setting_value FROM system_settings WHERE setting_key IN (?, ?, ?)',
      ['working_days_per_month', 'tax_rate', 'working_hours_per_day']
    );

    const settingsMap: any = {};
    settings.forEach((s: any) => {
      settingsMap[s.setting_key] = parseFloat(s.setting_value);
    });

    const workingDaysPerMonth = settingsMap['working_days_per_month'] || 22;
    const taxRate = settingsMap['tax_rate'] || 10;
    const workingHoursPerDay = settingsMap['working_hours_per_day'] || 8;

    // Get all active employees
    const [employees]: any = await pool.execute(
      'SELECT e.*, u.email FROM employees e JOIN users u ON e.user_id = u.id WHERE e.status = ?',
      ['active']
    );

    // Get attendance for the month
    const daysInMonth = getDaysInMonth(month, year);
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;

    // Get approved leaves for the month
    const [leaves]: any = await pool.execute(
      `SELECT employee_id, SUM(total_days) as total_leave_days
       FROM leave_requests
       WHERE status = 'Approved'
       AND YEAR(start_date) = ? AND MONTH(start_date) = ?
       GROUP BY employee_id`,
      [year, month]
    );

    const leaveMap: any = {};
    leaves.forEach((l: any) => {
      leaveMap[l.employee_id] = l.total_leave_days || 0;
    });

    // Get attendance for the month
    const [attendance]: any = await pool.execute(
      `SELECT employee_id, 
       COUNT(CASE WHEN status IN ('Present', 'Late') THEN 1 END) as present_days,
       COUNT(CASE WHEN status = 'Absent' THEN 1 END) as absent_days
       FROM attendance
       WHERE YEAR(date) = ? AND MONTH(date) = ?
       GROUP BY employee_id`,
      [year, month]
    );

    const attendanceMap: any = {};
    attendance.forEach((a: any) => {
      attendanceMap[a.employee_id] = {
        present: a.present_days || 0,
        absent: a.absent_days || 0,
      };
    });

    // Create payrun
    const [payrunResult]: any = await pool.execute(
      `INSERT INTO payruns (month, year, status, generated_by, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [month, year, 'Draft', payload.userId]
    );

    const payrunId = payrunResult.insertId;
    let totalGross = 0;
    let totalDeductions = 0;
    let totalNet = 0;

    const roundAmount = (value: number) => Number.parseFloat((value || 0).toFixed(2));

    // Calculate payroll for each employee
    for (const employee of employees) {
      const empId = employee.id;
      const presentDays = attendanceMap[empId]?.present || 0;
      const absentDays = attendanceMap[empId]?.absent || 0;
      const leaveDays = leaveMap[empId] || 0;

      // Calculate salary
      const basicSalary = Number.parseFloat(employee.basic_salary) || 0;
      const allowances = Number.parseFloat(employee.allowances) || 0;
      
      // Per day salary (for absent days calculation)
      const perDaySalary = basicSalary / workingDaysPerMonth;
      
      // Calculate working days (present + approved leaves are paid)
      const paidDays = presentDays + leaveDays;
      const unpaidDays = Math.max(0, workingDaysPerMonth - paidDays);
      
      // Calculate basic salary based on paid days
      const calculatedBasic = perDaySalary * paidDays;
      
      // Gross salary = calculated basic + allowances (full allowances)
      const grossSalary = calculatedBasic + allowances;

      // Deductions
      const pfDeduction = (calculatedBasic * 12) / 100; // 12% PF on calculated basic
      const taxDeduction = (grossSalary * taxRate) / 100; // Tax on gross salary
      const unpaidLeaveDeduction = unpaidDays > 0 ? perDaySalary * unpaidDays : 0; // Unpaid days deduction

      const empTotalDeductions = pfDeduction + taxDeduction + unpaidLeaveDeduction;
      const netSalary = Math.max(0, grossSalary - empTotalDeductions);

      // Insert payroll record
      await pool.execute(
        `INSERT INTO payroll (
          employee_id, payrun_id, month, year,
          basic_salary, allowances, deductions, gross_salary, net_salary,
          working_days, present_days, absent_days, leave_days,
          status, generated_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          empId,
          payrunId,
          month,
          year,
          roundAmount(calculatedBasic),
          roundAmount(allowances),
          roundAmount(empTotalDeductions),
          roundAmount(grossSalary),
          roundAmount(netSalary),
          workingDaysPerMonth,
          presentDays,
          absentDays,
          leaveDays,
          'Draft',
          payload.userId,
        ]
      );

      totalGross += roundAmount(grossSalary);
      totalDeductions += roundAmount(empTotalDeductions);
      totalNet += roundAmount(netSalary);
    }

    // Update payrun totals
    await pool.execute(
      `UPDATE payruns 
       SET total_employees = ?, 
           total_gross_salary = ?, 
           total_deductions = ?, 
           total_net_salary = ?,
           status = 'Pending Approval'
       WHERE id = ?`,
      [employees.length, totalGross, totalDeductions, totalNet, payrunId]
    );

    // Create notification for payroll officer
    const [payrollUsers]: any = await pool.execute(
      'SELECT id FROM users WHERE role = ? AND is_active = TRUE',
      ['payroll_officer']
    );

    for (const user of payrollUsers) {
      await pool.execute(
        `INSERT INTO notifications (user_id, title, message, type, action_url, created_at)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [
          user.id,
          'Payrun Generated',
          `Payroll for ${month}/${year} has been generated. Please review and approve.`,
          'info',
          `/payroll`
        ]
      );
    }

    return NextResponse.json({
      message: 'Payroll generated successfully',
      payrunId,
      totalEmployees: employees.length,
      totalGross,
      totalDeductions,
      totalNet,
    });
  } catch (error) {
    console.error('Generate payroll error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
