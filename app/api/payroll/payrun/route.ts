import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';
import { generatePayslipsForPayrun } from '@/lib/payslip-generator';
import { sendEmail } from '@/lib/email';

type RowData = {
  month: number;
  year: number;
  total_employees: number;
  total_gross_salary: number;
  total_deductions: number;
  total_net_salary: number;
};

async function syncLegacyPayruns(userId?: number | null) {
  const [orphanedRows]: any = await pool.execute(
    `SELECT month, year,
            COUNT(DISTINCT employee_id) AS total_employees,
            SUM(COALESCE(gross_salary, 0)) AS total_gross_salary,
            SUM(COALESCE(deductions, 0)) AS total_deductions,
            SUM(COALESCE(net_salary, 0)) AS total_net_salary
     FROM payroll
     WHERE payrun_id IS NULL OR payrun_id = 0
     GROUP BY year, month`
  );

  if (!Array.isArray(orphanedRows) || orphanedRows.length === 0) {
    return;
  }

  for (const raw of orphanedRows as RowData[]) {
    const month = Number(raw.month);
    const year = Number(raw.year);

    if (!month || !year) {
      continue;
    }

    const totals = {
      employees: Number(raw.total_employees) || 0,
      gross: Number(raw.total_gross_salary) || 0,
      deductions: Number(raw.total_deductions) || 0,
      net: Number(raw.total_net_salary) || 0,
    };

    const [existing]: any = await pool.execute(
      'SELECT id FROM payruns WHERE month = ? AND year = ? LIMIT 1',
      [month, year]
    );

    let payrunId: number;

    if (Array.isArray(existing) && existing.length > 0) {
      payrunId = existing[0].id;
      await pool.execute(
        `UPDATE payruns
         SET total_employees = ?,
             total_gross_salary = ?,
             total_deductions = ?,
             total_net_salary = ?,
             updated_at = NOW()
         WHERE id = ?`,
        [totals.employees, totals.gross, totals.deductions, totals.net, payrunId]
      );
    } else {
      const [insertResult]: any = await pool.execute(
        `INSERT INTO payruns (
            month,
            year,
            status,
            total_employees,
            total_gross_salary,
            total_deductions,
            total_net_salary,
            generated_by,
            created_at,
            updated_at
         )
         VALUES (?, ?, 'Pending Approval', ?, ?, ?, ?, ?, NOW(), NOW())`,
        [month, year, totals.employees, totals.gross, totals.deductions, totals.net, userId ?? null]
      );
      payrunId = insertResult.insertId;
    }

    await pool.execute(
      `UPDATE payroll
       SET payrun_id = ?
       WHERE month = ? AND year = ? AND (payrun_id IS NULL OR payrun_id = 0)`,
      [payrunId, month, year]
    );
  }
}

// GET all payruns
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

    await syncLegacyPayruns(payload.userId);

    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    const status = searchParams.get('status');

    let query = `
      SELECT p.*, 
             u1.email as generated_by_email,
             u2.email as approved_by_email
      FROM payruns p
      LEFT JOIN users u1 ON p.generated_by = u1.id
      LEFT JOIN users u2 ON p.approved_by = u2.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (month) {
      query += ' AND p.month = ?';
      params.push(month);
    }

    if (year) {
      query += ' AND p.year = ?';
      params.push(year);
    }

    if (status) {
      query += ' AND p.status = ?';
      params.push(status);
    }

    query += ' ORDER BY p.year DESC, p.month DESC';

    const [payruns] = await pool.execute(query, params);

    return NextResponse.json(payruns);
  } catch (error) {
    console.error('Get payruns error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST approve payrun
export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { payrunId, action, notes } = await request.json();

    if (!payrunId || !action) {
      return NextResponse.json({ error: 'Payrun ID and action are required' }, { status: 400 });
    }

    const [existingRows]: any = await pool.execute(
      'SELECT status FROM payruns WHERE id = ?',
      [payrunId]
    );

    if (!existingRows || existingRows.length === 0) {
      return NextResponse.json({ error: 'Payrun not found' }, { status: 404 });
    }

    const currentStatus = existingRows[0].status as string;

    let status = 'Pending Approval';
    if (action === 'approve') {
      status = 'Approved';
    } else if (action === 'reject') {
      status = 'Rejected';
    } else if (action === 'lock') {
      status = 'Locked';
    }

    if (currentStatus === status && status === 'Approved') {
      return NextResponse.json({ message: 'Payrun already approved' }, { status: 200 });
    }

    // Update payrun
    await pool.execute(
      `UPDATE payruns 
       SET status = ?, approved_by = ?, approved_at = NOW(), notes = ?
       WHERE id = ?`,
      [status, payload.userId, notes || null, payrunId]
    );

    // If approved, update all payroll records and generate payslips
    let payslipSummary: any = null;
    if (status === 'Approved') {
      await pool.execute(
        `UPDATE payroll SET status = 'Processed' WHERE payrun_id = ?`,
        [payrunId]
      );

      try {
        payslipSummary = await generatePayslipsForPayrun(Number(payrunId));
      } catch (payslipError) {
        console.error('Payslip generation failed:', payslipError);
        return NextResponse.json(
          { error: 'Payrun approved but payslips failed to generate. Please retry.', details: `${payslipError}` },
          { status: 500 }
        );
      }

      try {
        const [[run]]: any = await pool.execute(
          'SELECT month, year, total_employees, total_net_salary FROM payruns WHERE id = ? LIMIT 1',
          [payrunId]
        );
        const [[adminUser]]: any = await pool.execute(
          'SELECT email FROM users WHERE id = ? LIMIT 1',
          [payload.userId]
        );
        const adminEmail = adminUser?.email;
        if (adminEmail && run) {
          const subject = `Payrun Approved: ${String(run.month).padStart(2, '0')}/${run.year}`;
          const html = `
            <div style="font-family: Arial, sans-serif;">
              <h2>Payrun Approved</h2>
              <p>You approved a payrun.</p>
              <ul>
                <li><strong>Month:</strong> ${String(run.month).padStart(2, '0')}</li>
                <li><strong>Year:</strong> ${run.year}</li>
                <li><strong>Employees:</strong> ${run.total_employees ?? 0}</li>
                <li><strong>Total Net:</strong> ₹${Number(run.total_net_salary || 0).toLocaleString()}</li>
                ${payslipSummary ? `<li><strong>Payslips:</strong> ${payslipSummary.total}, Emails sent: ${payslipSummary.emailsSent}, Failed: ${payslipSummary.emailsFailed}</li>` : ''}
              </ul>
            </div>`;
          await sendEmail({ to: adminEmail, subject, html });
        }
      } catch (emailErr) {
        console.error('Failed to email admin on payrun approval:', emailErr);
      }
    }

    return NextResponse.json({
      message: `Payrun ${action}d successfully`,
      status,
      payslips: payslipSummary,
    });
  } catch (error) {
    console.error('Approve payrun error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
