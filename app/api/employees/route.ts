import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { sendEmail, emailTemplates } from '@/lib/email';

const HR_ROLES = ['admin', 'hr'];
const ALLOWED_USER_ROLES = ['employee', 'hr', 'payroll_officer', 'admin'];

const toNullableNumber = (value: any) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const normalizeStatus = (status?: string) => {
  if (!status) {
    return 'active';
  }
  const allowed = ['active', 'inactive', 'terminated'];
  return allowed.includes(status) ? status : 'active';
};

const ensureAuth = (request: NextRequest) => {
  const token = getTokenFromRequest(request);
  if (!token) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  const payload = verifyToken(token);
  if (!payload) {
    return { error: NextResponse.json({ error: 'Invalid token' }, { status: 401 }) };
  }
  return { payload };
};

const ensureHR = (request: NextRequest) => {
  const auth = ensureAuth(request);
  if (auth.error) {
    return auth;
  }
  if (!HR_ROLES.includes(auth.payload.role)) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }
  return auth;
};

/**
 * GET /api/employees
 * Returns all employees with linked user data.
 */
export async function GET(request: NextRequest) {
  const auth = ensureAuth(request);
  if (auth.error) {
    return auth.error;
  }

  try {
    const [employees] = await pool.execute(
      `SELECT e.*, u.email as user_email, u.role, u.role as user_role, u.is_active
       FROM employees e
       LEFT JOIN users u ON e.user_id = u.id
       ORDER BY e.created_at DESC`
    );
    return NextResponse.json(employees);
  } catch (error) {
    console.error('Get employees error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/employees
 * Creates a new employee and user account, sends credential email.
 */
export async function POST(request: NextRequest) {
  const hr = ensureHR(request);
  if (hr.error) {
    return hr.error;
  }
  const requester = (hr as any).payload || {};
  const requesterRole: string = requester.role ?? 'employee';

  let connection: any;

  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      gender,
      address,
      department,
      designation,
      joinDate,
      basicSalary,
      allowances,
      role: requestedRole = 'employee',
      password,
      status,
    } = body;

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: 'First name, last name, email, and password are required' },
        { status: 400 }
      );
    }

    if (String(password).length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const normalizedStatus = normalizeStatus(status);

    let targetRole = typeof requestedRole === 'string' ? requestedRole : 'employee';
    if (!ALLOWED_USER_ROLES.includes(targetRole)) {
      targetRole = 'employee';
    }
    if (requesterRole !== 'admin') {
      targetRole = 'employee';
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [lastEmployee]: any = await connection.execute(
      'SELECT employee_code FROM employees ORDER BY id DESC LIMIT 1'
    );
    const previousCode = lastEmployee[0]?.employee_code || 'EMP000';
    const nextNumber = parseInt(previousCode.slice(3), 10) + 1;
    const employeeCode = `EMP${String(nextNumber).padStart(3, '0')}`;

    const hashedPassword = await bcrypt.hash(password, 10);
    const [userResult]: any = await connection.execute(
      'INSERT INTO users (email, password, role, is_active) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, targetRole, normalizedStatus === 'active']
    );

    const userId = userResult.insertId;

    const [employeeResult]: any = await connection.execute(
      `INSERT INTO employees (
        user_id, employee_code, first_name, last_name, email, phone,
        date_of_birth, gender, address, department, designation,
        join_date, basic_salary, allowances, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        employeeCode,
        firstName,
        lastName,
        email,
        phone || null,
        dateOfBirth || null,
        gender || null,
        address || null,
        department || null,
        designation || null,
        joinDate || null,
        toNullableNumber(basicSalary),
        toNullableNumber(allowances),
        normalizedStatus,
      ]
    );

    await connection.execute(
      `INSERT INTO notifications (user_id, title, message, type, action_url, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [
        userId,
        'Welcome to WorkZen HRMS',
        `Your account has been created. Check your email (${email}) for login credentials.`,
        'success',
        '/login',
      ]
    );

    await connection.commit();

    const template = emailTemplates.employeeCredentials(
      email,
      password,
      `${firstName} ${lastName}`.trim(),
      employeeCode
    );

    try {
      await sendEmail({ to: email, subject: template.subject, html: template.html });
    } catch (emailError) {
      console.error('Failed to send credentials email:', emailError);
    }

    return NextResponse.json({
      id: employeeResult.insertId,
      employeeCode,
      message: 'Employee created successfully. Credentials sent to email.',
    });
  } catch (error: any) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    console.error('Create employee error:', error);
    if (error?.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

/**
 * PUT /api/employees
 * Updates employee and user records, optionally resets password and emails credentials.
 */
export async function PUT(request: NextRequest) {
  const hr = ensureHR(request);
  if (hr.error) {
    return hr.error;
  }
  const requester = (hr as any).payload || {};
  const requesterRole: string = requester.role ?? 'employee';

  let connection: any;

  try {
    const body = await request.json();
    const {
      id,
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      gender,
      address,
      department,
      designation,
      joinDate,
      basicSalary,
      allowances,
      status,
      role,
      password,
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'Employee ID is required' }, { status: 400 });
    }

    const [existing]: any = await pool.execute(
      `SELECT e.*, u.email as user_email, u.role as user_role, u.id as user_id
       FROM employees e
       JOIN users u ON e.user_id = u.id
       WHERE e.id = ?`,
      [id]
    );

    if (existing.length === 0) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    const employee = existing[0];

    const employeeUpdates: string[] = [];
    const employeeParams: any[] = [];
    const userUpdates: string[] = [];
    const userParams: any[] = [];

    const resolvedFirstName = firstName ?? employee.first_name;
    const resolvedLastName = lastName ?? employee.last_name;
    const resolvedEmail = email ?? employee.user_email;
    const resolvedStatus = normalizeStatus(status ?? employee.status);

    if (firstName !== undefined) {
      employeeUpdates.push('first_name = ?');
      employeeParams.push(firstName);
    }
    if (lastName !== undefined) {
      employeeUpdates.push('last_name = ?');
      employeeParams.push(lastName);
    }
    if (email !== undefined) {
      employeeUpdates.push('email = ?');
      employeeParams.push(email);
      userUpdates.push('email = ?');
      userParams.push(email);
    }
    if (phone !== undefined) {
      employeeUpdates.push('phone = ?');
      employeeParams.push(phone || null);
    }
    if (dateOfBirth !== undefined) {
      employeeUpdates.push('date_of_birth = ?');
      employeeParams.push(dateOfBirth || null);
    }
    if (gender !== undefined) {
      employeeUpdates.push('gender = ?');
      employeeParams.push(gender || null);
    }
    if (address !== undefined) {
      employeeUpdates.push('address = ?');
      employeeParams.push(address || null);
    }
    if (department !== undefined) {
      employeeUpdates.push('department = ?');
      employeeParams.push(department || null);
    }
    if (designation !== undefined) {
      employeeUpdates.push('designation = ?');
      employeeParams.push(designation || null);
    }
    if (joinDate !== undefined) {
      employeeUpdates.push('join_date = ?');
      employeeParams.push(joinDate || null);
    }
    if (basicSalary !== undefined) {
      employeeUpdates.push('basic_salary = ?');
      employeeParams.push(toNullableNumber(basicSalary));
    }
    if (allowances !== undefined) {
      employeeUpdates.push('allowances = ?');
      employeeParams.push(toNullableNumber(allowances));
    }
    if (status !== undefined) {
      employeeUpdates.push('status = ?');
      employeeParams.push(resolvedStatus);
      userUpdates.push('is_active = ?');
      userParams.push(resolvedStatus === 'active');
    }
    if (role !== undefined && requesterRole === 'admin') {
      const sanitizedRole = ALLOWED_USER_ROLES.includes(role) ? role : employee.user_role;
      userUpdates.push('role = ?');
      userParams.push(sanitizedRole);
    }

    if (employeeUpdates.length === 0 && userUpdates.length === 0 && !password) {
      return NextResponse.json({ message: 'No changes detected' });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    if (userUpdates.length > 0) {
      await connection.execute(
        `UPDATE users SET ${userUpdates.join(', ')} WHERE id = ?`,
        [...userParams, employee.user_id]
      );
    }

    if (employeeUpdates.length > 0) {
      await connection.execute(
        `UPDATE employees SET ${employeeUpdates.join(', ')} WHERE id = ?`,
        [...employeeParams, id]
      );
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await connection.execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, employee.user_id]);
    }

    await connection.commit();

    if (password) {
      const template = emailTemplates.employeeCredentials(
        resolvedEmail,
        password,
        `${resolvedFirstName} ${resolvedLastName}`.trim(),
        employee.employee_code
      );

      try {
        await sendEmail({ to: resolvedEmail, subject: template.subject, html: template.html });
      } catch (emailError) {
        console.error('Failed to send updated credentials email:', emailError);
      }
    }

    return NextResponse.json({ message: 'Employee updated successfully' });
  } catch (error) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    console.error('Update employee error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

/**
 * DELETE /api/employees?id=123
 * Deletes employee and associated user record.
 */
export async function DELETE(request: NextRequest) {
  const hr = ensureHR(request);
  if (hr.error) {
    return hr.error;
  }

  let connection: any;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Employee ID is required' }, { status: 400 });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [existing]: any = await connection.execute('SELECT user_id FROM employees WHERE id = ?', [id]);
    if (existing.length === 0) {
      await connection.rollback();
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    const userId = existing[0].user_id;

    await connection.execute('DELETE FROM employees WHERE id = ?', [id]);
    await connection.execute('DELETE FROM users WHERE id = ?', [userId]);

    await connection.commit();

    return NextResponse.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    console.error('Delete employee error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
