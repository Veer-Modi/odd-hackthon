import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';
import { sendEmail, emailTemplates } from '@/lib/email';

// GET leave requests
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
    let employeeId = searchParams.get('employeeId');
    const status = searchParams.get('status');
    const roleParam = searchParams.get('role');

    // Get employee ID if user is employee
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
      SELECT lr.*, e.first_name, e.last_name, e.employee_code, lt.name as leave_type_name, u.role as user_role
      FROM leave_requests lr
      JOIN employees e ON lr.employee_id = e.id
      JOIN leave_types lt ON lr.leave_type_id = lt.id
      LEFT JOIN users u ON e.user_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (employeeId) {
      query += ' AND lr.employee_id = ?';
      params.push(employeeId);
    }

    if (status) {
      query += ' AND lr.status = ?';
      params.push(status);
    }

    if (roleParam) {
      if (payload.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      query += ' AND u.role = ?';
      params.push(roleParam);
    }

    query += ' ORDER BY lr.created_at DESC';

    const [requests] = await pool.execute(query, params);

    return NextResponse.json(requests);
  } catch (error) {
    console.error('Get leave requests error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST create leave request
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

    const { leaveTypeId, startDate, endDate, reason, attachmentPath, attachmentName } = await request.json();

    // Get employee ID from user
    const [employees]: any = await pool.execute(
      'SELECT id FROM employees WHERE user_id = ?',
      [payload.userId]
    );

    if (employees.length === 0) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    const employeeId = employees[0].id;

    // Calculate total days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Insert leave request
    const [result]: any = await pool.execute(
      `INSERT INTO leave_requests (employee_id, leave_type_id, start_date, end_date, total_days, reason, attachment_path, attachment_name)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [employeeId, leaveTypeId, startDate, endDate, totalDays, reason, attachmentPath || null, attachmentName || null]
    );

    const leaveRequestId = result.insertId;

    // Get employee name and role for notification
    const [employeeInfo]: any = await pool.execute(
      'SELECT e.first_name, e.last_name, u.role FROM employees e JOIN users u ON e.user_id = u.id WHERE e.id = ?',
      [employeeId]
    );
    const employeeName = employeeInfo[0] ? `${employeeInfo[0].first_name} ${employeeInfo[0].last_name}` : 'Employee';
    const employeeRole = employeeInfo[0]?.role || 'employee';

    // Get leave type name
    const [leaveTypeInfo]: any = await pool.execute(
      'SELECT name FROM leave_types WHERE id = ?',
      [leaveTypeId]
    );
    const leaveTypeName = leaveTypeInfo[0]?.name || 'Leave';

    // Determine who should receive notifications
    // If employee is HR or Payroll Officer, only admin gets notification
    // If employee is regular employee, HR and Admin get notification
    let notificationUsers: any[] = [];

    if (employeeRole === 'hr' || employeeRole === 'payroll_officer') {
      // HR/Payroll Officer leave requests go to admin only
      const [adminUsers]: any = await pool.execute(
        'SELECT id FROM users WHERE role = ? AND is_active = TRUE',
        ['admin']
      );
      notificationUsers = adminUsers;

      // Mark leave request as requiring admin approval
      await pool.execute(
        'UPDATE leave_requests SET requires_admin_approval = TRUE WHERE id = ?',
        [leaveRequestId]
      );
    } else {
      // Regular employee leave requests go to HR and Admin
      const [hrUsers]: any = await pool.execute(
        'SELECT id FROM users WHERE role IN (?, ?) AND is_active = TRUE',
        ['hr', 'admin']
      );
      notificationUsers = hrUsers;
    }

    // Create notifications
    for (const user of notificationUsers) {
      await pool.execute(
        `INSERT INTO notifications (user_id, title, message, type, action_url, created_at)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [
          user.id,
          'New Leave Request',
          `${employeeName} (${employeeRole}) has applied for ${leaveTypeName} from ${startDate} to ${endDate} (${totalDays} days)`,
          'info',
          `/leave`
        ]
      );
    }

    return NextResponse.json({ 
      message: 'Leave request submitted successfully',
      id: leaveRequestId
    });
  } catch (error) {
    console.error('Create leave request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT update leave request status
export async function PUT(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || !['admin', 'hr'].includes(payload.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id, status, rejectionReason } = await request.json();

    // Get leave request details
    const [leaveRequest]: any = await pool.execute(
      `SELECT lr.*, e.first_name, e.last_name, e.user_id, lt.name as leave_type_name, u.role as employee_user_role
       FROM leave_requests lr
       JOIN employees e ON lr.employee_id = e.id
       JOIN leave_types lt ON lr.leave_type_id = lt.id
       JOIN users u ON e.user_id = u.id
       WHERE lr.id = ?`,
      [id]
    );

    if (leaveRequest.length === 0) {
      return NextResponse.json({ error: 'Leave request not found' }, { status: 404 });
    }

    const requestData = leaveRequest[0];

    // Update leave request
    await pool.execute(
      `UPDATE leave_requests 
       SET status = ?, approved_by = ?, approved_at = NOW(), rejection_reason = ?
       WHERE id = ?`,
      [status, payload.userId, rejectionReason || null, id]
    );

    // Create notification for employee
    const employeeName = `${requestData.first_name} ${requestData.last_name}`;
    const notificationMessage = status === 'Approved'
      ? `Your ${requestData.leave_type_name} request from ${requestData.start_date} to ${requestData.end_date} has been approved.`
      : `Your ${requestData.leave_type_name} request from ${requestData.start_date} to ${requestData.end_date} has been rejected.${rejectionReason ? ` Reason: ${rejectionReason}` : ''}`;

    const [notificationResult]: any = await pool.execute(
      `INSERT INTO notifications (user_id, title, message, type, action_url, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [
        requestData.user_id,
        `Leave Request ${status}`,
        notificationMessage,
        status === 'Approved' ? 'success' : 'error',
        '/leave'
      ]
    );

    try {
      const [employeeUser]: any = await pool.execute(
        'SELECT email FROM users WHERE id = ?',
        [requestData.user_id]
      );

      if (employeeUser.length > 0 && employeeUser[0].email) {
        const employeeName = `${requestData.first_name} ${requestData.last_name}`;

        if (status === 'Approved') {
          const emailTemplate = emailTemplates.leaveApproved(
            employeeName,
            requestData.leave_type_name,
            requestData.start_date,
            requestData.end_date,
            requestData.total_days
          );

          await sendEmail({
            to: employeeUser[0].email,
            subject: emailTemplate.subject,
            html: emailTemplate.html,
          });
        } else {
          const emailTemplate = emailTemplates.leaveRejected(
            employeeName,
            requestData.leave_type_name,
            requestData.start_date,
            requestData.end_date,
            rejectionReason || 'No reason provided'
          );

          await sendEmail({
            to: employeeUser[0].email,
            subject: emailTemplate.subject,
            html: emailTemplate.html,
          });
        }

        // If admin approved HR's leave, also send confirmation to the acting admin
        if (payload.role === 'admin' && requestData.employee_user_role === 'hr' && status === 'Approved') {
          const [actingAdmin]: any = await pool.execute(
            'SELECT email FROM users WHERE id = ?',
            [payload.userId]
          );
          const adminEmail = actingAdmin?.[0]?.email;
          if (adminEmail) {
            const subject = `HR Leave Approved: ${employeeName} (${requestData.start_date} - ${requestData.end_date})`;
            const html = `
              <div style="font-family: Arial, sans-serif;">
                <h2>HR Leave Approved</h2>
                <p>You approved an HR leave request.</p>
                <ul>
                  <li><strong>Employee:</strong> ${employeeName}</li>
                  <li><strong>Type:</strong> ${requestData.leave_type_name}</li>
                  <li><strong>Dates:</strong> ${requestData.start_date} to ${requestData.end_date} (${requestData.total_days} days)</li>
                </ul>
              </div>`;
            await sendEmail({ to: adminEmail, subject, html });
          }
        }

        if (notificationResult?.insertId) {
          await pool.execute(
            'UPDATE notifications SET email_sent = TRUE, email_sent_at = NOW() WHERE id = ?',
            [notificationResult.insertId]
          );
        }
      }
    } catch (emailError) {
      console.error('Failed to send leave status email:', emailError);
    }

    return NextResponse.json({ message: 'Leave request updated successfully' });
  } catch (error) {
    console.error('Update leave request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
