import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

type TrendRow = {
  year: number;
  month: number;
  total?: string | number;
  present_count?: string | number;
  total_records?: string | number;
};

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    const sixMonthsAgo = new Date(currentYear, currentMonth - 6, 1);
    const sixMonthsStart = `${sixMonthsAgo.getFullYear()}-${String(sixMonthsAgo.getMonth() + 1).padStart(2, '0')}-01`;

    // Employees summary
    const [employeeCounts]: any = await pool.execute(
      `SELECT status, COUNT(*) as count
       FROM employees
       GROUP BY status`
    );

    const totalEmployees = employeeCounts.reduce((sum: number, row: any) => sum + Number(row.count || 0), 0);
    const activeEmployees = employeeCounts
      .filter((row: any) => row.status === 'active')
      .reduce((sum: number, row: any) => sum + Number(row.count || 0), 0);

    const [departmentCount]: any = await pool.execute(
      'SELECT COUNT(*) as count FROM departments'
    );

    const [presentCount]: any = await pool.execute(
      `SELECT COUNT(*) as count
       FROM attendance
       WHERE date = ? AND status IN ('Present', 'Late')`,
      [todayStr]
    );

    const [pendingLeaves]: any = await pool.execute(
      `SELECT COUNT(*) as count
       FROM leave_requests
       WHERE status = 'Pending'`
    );

    const [payrollSum]: any = await pool.execute(
      `SELECT COALESCE(SUM(net_salary), 0) as total
       FROM payroll
       WHERE month = ? AND year = ?`,
      [currentMonth, currentYear]
    );

    const attendanceRate = activeEmployees > 0
      ? Number(((presentCount[0].count || 0) / activeEmployees) * 100).toFixed(1)
      : '0.0';

    // Recent activity from audit logs
    const [recentActivity]: any = await pool.execute(
      `SELECT al.id, al.user_id, al.action, al.entity, al.entity_id, al.details, al.created_at,
              u.email as user_email
       FROM audit_logs al
       LEFT JOIN users u ON al.user_id = u.id
       ORDER BY al.created_at DESC
       LIMIT 8`
    );

    // System alerts - latest notifications for admins
    const [adminUsers]: any = await pool.execute(
      `SELECT id FROM users WHERE role = 'admin' AND is_active = TRUE`
    );
    const adminIds = adminUsers.map((row: any) => row.id);

    let systemAlerts: any[] = [];
    if (adminIds.length > 0) {
      const placeholders = adminIds.map(() => '?').join(',');
      const [alerts]: any = await pool.execute(
        `SELECT id, user_id, title, message, type, created_at
         FROM notifications
         WHERE user_id IN (${placeholders})
         ORDER BY created_at DESC
         LIMIT 6`,
        adminIds
      );
      systemAlerts = alerts;
    }

    // Department analytics
    const [departmentStats]: any = await pool.execute(
      `SELECT
         COALESCE(department, 'Unassigned') as department,
         COUNT(*) as employees,
         ROUND(AVG(COALESCE(basic_salary, 0) + COALESCE(allowances, 0)), 2) as avg_salary,
         SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_count
       FROM employees
       GROUP BY department
       ORDER BY employees DESC`
    );

    // Attendance trend for last 6 months
    const [attendanceTrendRaw]: any = await pool.execute(
      `SELECT YEAR(date) as year, MONTH(date) as month,
              SUM(CASE WHEN status IN ('Present', 'Late') THEN 1 ELSE 0 END) as present_count,
              COUNT(*) as total_records
       FROM attendance
       WHERE date >= ?
       GROUP BY YEAR(date), MONTH(date)
       ORDER BY YEAR(date) DESC, MONTH(date) DESC
       LIMIT 6`,
      [sixMonthsStart]
    );

    const attendanceTrend = (attendanceTrendRaw as TrendRow[])
      .map((row) => ({
        year: Number(row.year),
        month: Number(row.month),
        presentCount: Number(row.present_count || 0),
        totalRecords: Number(row.total_records || 0),
      }))
      .reverse();

    // Payroll trend for last 6 months
    const [payrollTrendRaw]: any = await pool.execute(
      `SELECT year, month, COALESCE(SUM(net_salary), 0) as total
       FROM payroll
       WHERE CONCAT(year, '-', LPAD(month, 2, '0'), '-01') >= ?
       GROUP BY year, month
       ORDER BY year DESC, month DESC
       LIMIT 6`,
      [sixMonthsStart]
    );

    const payrollTrend = (payrollTrendRaw as TrendRow[])
      .map((row) => ({
        year: Number(row.year),
        month: Number(row.month),
        total: Number(row.total || 0),
      }))
      .reverse();

    // Leave breakdown for current month
    const [leaveBreakdown]: any = await pool.execute(
      `SELECT lt.name as leave_type, COUNT(*) as count
       FROM leave_requests lr
       JOIN leave_types lt ON lr.leave_type_id = lt.id
       WHERE MONTH(lr.start_date) = ? AND YEAR(lr.start_date) = ?
       GROUP BY lt.name
       ORDER BY count DESC`,
      [currentMonth, currentYear]
    );

    const response = {
      stats: {
        totalEmployees,
        activeEmployees,
        totalDepartments: Number(departmentCount[0]?.count || 0),
        monthlyPayroll: Number(payrollSum[0]?.total || 0),
        presentToday: Number(presentCount[0]?.count || 0),
        attendanceRate: Number(attendanceRate),
        pendingLeaves: Number(pendingLeaves[0]?.count || 0),
      },
      recentActivity: recentActivity.map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        userEmail: row.user_email,
        action: row.action,
        entity: row.entity,
        entityId: row.entity_id,
        details: row.details,
        createdAt: row.created_at,
      })),
      systemAlerts: systemAlerts.map((alert: any) => ({
        id: alert.id,
        title: alert.title,
        message: alert.message,
        type: alert.type,
        createdAt: alert.created_at,
      })),
      departmentStats: departmentStats.map((dept: any) => ({
        name: dept.department,
        employees: Number(dept.employees || 0),
        avgSalary: Number(dept.avg_salary || 0),
        activeEmployees: Number(dept.active_count || 0),
      })),
      attendanceTrend,
      payrollTrend,
      leaveBreakdown: leaveBreakdown.map((leave: any) => ({
        type: leave.leave_type,
        count: Number(leave.count || 0),
      })),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
