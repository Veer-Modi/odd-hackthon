import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';
import { signToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { companyName, adminName, email, phone, password, address } = await request.json();

    // Validation
    if (!companyName || !adminName || !email || !phone || !password) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const [existingUsers]: any = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create admin user
      const [userResult]: any = await connection.execute(
        'INSERT INTO users (email, password, role, is_active) VALUES (?, ?, ?, ?)',
        [email, hashedPassword, 'admin', true]
      );

      const userId = userResult.insertId;

      // Create company/employee record for admin
      // Generate employee code
      const [lastEmployee]: any = await connection.execute(
        'SELECT employee_code FROM employees ORDER BY id DESC LIMIT 1'
      );
      const lastCode = lastEmployee[0]?.employee_code || 'EMP000';
      const newCodeNumber = parseInt(lastCode.slice(3)) + 1;
      const employeeCode = `EMP${newCodeNumber.toString().padStart(3, '0')}`;

      // Split admin name into first and last name
      const nameParts = adminName.trim().split(' ');
      const firstName = nameParts[0] || adminName;
      const lastName = nameParts.slice(1).join(' ') || '';

      // Create employee record for admin
      await connection.execute(
        `INSERT INTO employees (
          user_id, employee_code, first_name, last_name, email, phone, 
          address, department, designation, join_date, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), ?)`,
        [
          userId,
          employeeCode,
          firstName,
          lastName,
          email,
          phone,
          address || '',
          'Administration',
          'Company Admin',
          'active'
        ]
      );

      // Create a company settings record (if you have a companies table, use that instead)
      // For now, we'll store company name in system_settings
      await connection.execute(
        'INSERT INTO system_settings (setting_key, setting_value, description, updated_by) VALUES (?, ?, ?, ?)',
        [`company_name_${userId}`, companyName, `Company name for user ${userId}`, userId]
      );

      // Commit transaction
      await connection.commit();
      connection.release();

      // Generate token
      const token = signToken({
        userId: userId,
        email: email,
        role: 'admin',
      });

      return NextResponse.json({
        message: 'Company account created successfully',
        token,
        user: {
          id: userId,
          email: email,
          role: 'admin',
          firstName: firstName,
          lastName: lastName,
          employeeCode: employeeCode,
        },
      }, { status: 201 });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error: any) {
    console.error('Signup error:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

