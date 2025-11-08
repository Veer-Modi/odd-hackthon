'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Shield, Users, Calendar, DollarSign, Settings, Bell, LogOut, TrendingUp,
  CheckCircle, Clock, AlertCircle, Activity, BarChart3, FileText, Database,
  ArrowLeft, Building2, Search, Loader2, ClipboardList, Briefcase, MapPin,
  Eye, Edit, RefreshCcw
} from 'lucide-react';

type EmployeeRow = {
  id: number;
  first_name: string;
  last_name: string;
  employee_code: string;
  department: string | null;
  designation: string | null;
  status: string;
  user_role: string;
};

type AttendanceRow = {
  id: number;
  employee_id: number;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: string;
  working_hours: number | null;
  first_name: string;
  last_name: string;
  employee_code: string;
  department: string | null;
  check_in_location: string | null;
  check_out_location: string | null;
};

type LeaveRow = {
  id: number;
  leave_type_name: string;
  start_date: string;
  end_date: string;
  total_days: number;
  status: string;
  first_name: string;
  last_name: string;
  employee_code: string;
};

type PayrunSummary = {
  id: number;
  month: number;
  year: number;
};

type PayrollRow = {
  id: number;
  employee_id: number;
  month: number;
  year: number;
  net_salary: number | string;
  status: string;
  first_name: string;
  last_name: string;
  employee_code: string;
  department: string | null;
  payrun_id: number | null;
};

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'overview' | 'attendance' | 'leave' | 'payroll' | 'employees' | 'roles'>('overview');
  const [stats, setStats] = useState({
    totalEmployees: 145,
    activeEmployees: 142,
    totalDepartments: 5,
    monthlyPayroll: 10850000,
    presentToday: 138,
    attendanceRate: 95.2,
    pendingLeaves: 12,
    approvedLeaves: 145,
    systemUptime: 99.9,
    activeUsers: 142,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [systemAlerts, setSystemAlerts] = useState<any[]>([]);
  const [departmentStats, setDepartmentStats] = useState<any[]>([]);
  const [attendanceRows, setAttendanceRows] = useState<AttendanceRow[]>([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceRoleFilter, setAttendanceRoleFilter] = useState<'hr' | 'payroll_officer' | 'employee' | 'all'>('hr');
  const [leaveRows, setLeaveRows] = useState<LeaveRow[]>([]);
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [payrunOptions, setPayrunOptions] = useState<PayrunSummary[]>([]);
  const [selectedPayrun, setSelectedPayrun] = useState<number | 'unassigned' | null>(null);
  const [payrollRows, setPayrollRows] = useState<PayrollRow[]>([]);
  const [payrollLoading, setPayrollLoading] = useState(false);
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleUpdates, setRoleUpdates] = useState<Record<number, string>>({});
  const [roleSavingId, setRoleSavingId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const allowedRoleOptions = useMemo(
    () => [
      { value: 'employee', label: 'Employee' },
      { value: 'hr', label: 'HR' },
      { value: 'payroll_officer', label: 'Payroll Officer' },
      { value: 'admin', label: 'Admin' },
    ],
    []
  );
  const [newEmployee, setNewEmployee] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'hr',
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    
    setUser(JSON.parse(userData));

    // Static demo data
    setRecentActivity([
      { id: 1, user: 'HR Manager', action: 'Approved leave request', entity: 'John Doe', time: '2 mins ago', type: 'success' },
      { id: 2, user: 'Payroll Officer', action: 'Generated payroll', entity: 'December 2023', time: '15 mins ago', type: 'info' },
      { id: 3, user: 'HR Manager', action: 'Added new employee', entity: 'Sarah Williams', time: '1 hour ago', type: 'success' },
      { id: 4, user: 'Admin', action: 'Updated system settings', entity: 'Working hours', time: '2 hours ago', type: 'warning' },
    ]);

    setSystemAlerts([
      { id: 1, type: 'warning', message: 'Database backup pending', time: '1 hour ago' },
      { id: 2, type: 'info', message: '12 leave requests awaiting approval', time: '3 hours ago' },
      { id: 3, type: 'success', message: 'Payroll processed successfully', time: '5 hours ago' },
    ]);

    setDepartmentStats([
      { name: 'IT', employees: 45, avgSalary: 75000, attendanceRate: 96.5 },
      { name: 'Finance', employees: 28, avgSalary: 80000, attendanceRate: 94.2 },
      { name: 'Sales', employees: 35, avgSalary: 75000, attendanceRate: 93.8 },
      { name: 'Operations', employees: 22, avgSalary: 75000, attendanceRate: 95.1 },
      { name: 'HR', employees: 15, avgSalary: 64000, attendanceRate: 97.3 },
    ]);

    setLoading(false);
  }, [router]);

  const loadAttendance = useCallback(async () => {
    try {
      setAttendanceLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;
      const params = new URLSearchParams();
      if (attendanceRoleFilter && attendanceRoleFilter !== 'all') params.set('role', attendanceRoleFilter);
      const res = await fetch(`/api/attendance${params.toString() ? `?${params.toString()}` : ''}` , {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load attendance');
      const data: AttendanceRow[] = await res.json();
      setAttendanceRows(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setErrorMessage(e?.message || 'Failed to load attendance');
    } finally {
      setAttendanceLoading(false);
    }
  }, [attendanceRoleFilter]);

  const loadLeaves = useCallback(async (role?: string) => {
    try {
      setLeaveLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;
      const params = new URLSearchParams();
      params.set('status', 'Pending');
      if (role) params.set('role', role);
      const res = await fetch(`/api/leave?${params.toString()}` , {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load leaves');
      const data: LeaveRow[] = await res.json();
      setLeaveRows(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setErrorMessage(e?.message || 'Failed to load leaves');
    } finally {
      setLeaveLoading(false);
    }
  }, []);

  const loadPayruns = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch('/api/payroll/payrun', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to load payruns');
      const data = await res.json();
      const rows: PayrunSummary[] = (Array.isArray(data) ? data : []).map((r: any) => ({ id: r.id, month: r.month, year: r.year }));
      setPayrunOptions(rows);
      if (rows.length > 0 && selectedPayrun == null) setSelectedPayrun(rows[0].id);
    } catch (e: any) {
      setErrorMessage(e?.message || 'Failed to load payruns');
    }
  }, [selectedPayrun]);

  const loadPayroll = useCallback(async () => {
    try {
      setPayrollLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;
      const params = new URLSearchParams();
      if (selectedPayrun && selectedPayrun !== 'unassigned') params.set('payrunId', String(selectedPayrun));
      if ((!selectedPayrun || selectedPayrun === 'unassigned') && attendanceRoleFilter && attendanceRoleFilter !== 'all') {
        params.set('role', attendanceRoleFilter);
      }
      const res = await fetch(`/api/payroll/list${params.toString() ? `?${params.toString()}` : ''}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load payroll');
      const data: PayrollRow[] = await res.json();
      setPayrollRows(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setErrorMessage(e?.message || 'Failed to load payroll');
    } finally {
      setPayrollLoading(false);
    }
  }, [selectedPayrun, attendanceRoleFilter]);

  const loadEmployees = useCallback(async () => {
    try {
      setEmployeesLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch('/api/employees', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to load employees');
      const data: EmployeeRow[] = await res.json();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setErrorMessage(e?.message || 'Failed to load employees');
    } finally {
      setEmployeesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === 'attendance') {
      loadAttendance();
    } else if (tab === 'leave') {
      loadLeaves(attendanceRoleFilter !== 'all' ? attendanceRoleFilter : undefined);
    } else if (tab === 'payroll') {
      loadPayruns();
      loadPayroll();
    } else if (tab === 'employees' || tab === 'roles') {
      loadEmployees();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, attendanceRoleFilter, selectedPayrun]);

  const handleSaveRole = async (employeeId: number) => {
    const role = roleUpdates[employeeId];
    if (!role) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      setRoleSavingId(employeeId);
      const res = await fetch('/api/employees', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: employeeId, role }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error || 'Failed to update role');
      }
      setRoleUpdates((prev) => ({ ...prev, [employeeId]: undefined as any }));
      await loadEmployees();
    } catch (e: any) {
      alert(e?.message || 'Failed to update role');
    } finally {
      setRoleSavingId(null);
    }
  };

  const handleLeaveAction = async (leaveId: number, newStatus: 'Approved' | 'Rejected') => {
    const token = localStorage.getItem('token');
    if (!token) return;

    let rejectionReason: string | undefined;
    if (newStatus === 'Rejected') {
      const input = window.prompt('Please provide a reason for rejection (optional):');
      if (input === null) {
        return;
      }
      rejectionReason = input.trim() || undefined;
    }

    try {
      const res = await fetch('/api/leave', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: leaveId, status: newStatus, rejectionReason }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result?.error || 'Failed to update leave');
      await loadLeaves(attendanceRoleFilter !== 'all' ? attendanceRoleFilter : undefined);
      alert(`Leave ${newStatus.toLowerCase()} successfully.`);
    } catch (e: any) {
      alert(e?.message || 'Failed to update leave');
    }
  };

  const handlePayrunAction = async (action: 'approve' | 'reject' | 'lock') => {
    const token = localStorage.getItem('token');
    if (!token) return;
    if (!selectedPayrun) {
      alert('Please select a payrun first.');
      return;
    }

    try {
      const res = await fetch('/api/payroll/payrun', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ payrunId: selectedPayrun, action }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result?.error || 'Failed to update payrun');
      await loadPayruns();
      await loadPayroll();
      alert(result?.message || 'Payrun updated');
    } catch (e: any) {
      alert(e?.message || 'Failed to update payrun');
    }
  };

  const handleCreateEmployee = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newEmployee),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result?.error || 'Failed to create employee');
      setNewEmployee({ firstName: '', lastName: '', email: '', password: '', role: 'hr' });
      await loadEmployees();
      alert('Employee created and credentials emailed.');
    } catch (e: any) {
      alert(e?.message || 'Failed to create employee');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
      {/* Top Bar */}
      <header className="glass sticky top-0 z-40 border-b border-white/20 backdrop-blur-xl">
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black gradient-text flex items-center space-x-2">
              <Shield className="h-6 w-6" />
              <span>Admin Dashboard</span>
            </h1>
            <p className="text-sm text-slate-600">System Administrator Control Panel</p>
          </div>
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="relative p-2 glass rounded-xl hover:bg-white/50 transition-colors"
            >
              <Bell className="h-5 w-5 text-slate-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/settings')}
              className="glass px-4 py-2 rounded-xl flex items-center space-x-2 hover:bg-white/80"
            >
              <Settings className="h-4 w-4" />
              <span className="font-semibold">Settings</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-xl font-semibold flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </motion.button>
          </div>
        </div>
      </header>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'attendance', label: 'Attendance' },
            { key: 'leave', label: 'Leave' },
            { key: 'payroll', label: 'Payroll' },
            { key: 'employees', label: 'Employees' },
            { key: 'roles', label: 'Roles' },
          ].map((t: any) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-3 py-1.5 rounded-xl text-sm font-semibold border transition ${
                tab === (t.key as any)
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white/80 text-slate-700 border-white/40 hover:border-blue-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
        <>
        {/* System Overview Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="premium-card mb-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl" />
          <div className="relative">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">System Overview</h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-slate-600 mb-1">System Status</p>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <p className="text-lg font-bold text-green-600">Operational</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Uptime</p>
                <p className="text-xl font-bold text-slate-900">{stats.systemUptime}%</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Active Sessions</p>
                <p className="text-xl font-bold text-slate-900">{stats.activeUsers}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Database Size</p>
                <p className="text-xl font-bold text-slate-900">2.4 GB</p>
              </div>
            </div>
          </div>
        </motion.div>
        </>
        )}

        {tab === 'attendance' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <label className="text-sm text-slate-600">Filter:</label>
                <select
                  className="glass px-3 py-2 rounded-xl text-sm"
                  value={attendanceRoleFilter}
                  onChange={(e) => setAttendanceRoleFilter(e.target.value as any)}
                >
                  <option value="hr">HR</option>
                  <option value="payroll_officer">Payroll Officer</option>
                  <option value="employee">Employee</option>
                  <option value="all">All</option>
                </select>
              </div>
              <button onClick={loadAttendance} className="rounded-xl bg-slate-900 text-white px-3 py-2 text-sm">Refresh</button>
            </div>
            <div className="premium-card overflow-x-auto">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Code</th>
                    <th>Date</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Status</th>
                    <th>Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceLoading ? (
                    <tr><td colSpan={7} className="text-center text-sm text-slate-500">Loading...</td></tr>
                  ) : attendanceRows.length === 0 ? (
                    <tr><td colSpan={7} className="text-center text-sm text-slate-500">No records</td></tr>
                  ) : (
                    attendanceRows.map((r) => (
                      <tr key={r.id}>
                        <td className="font-semibold">{r.first_name} {r.last_name}</td>
                        <td>{r.employee_code}</td>
                        <td>{new Date(r.date).toLocaleDateString()}</td>
                        <td>{r.check_in || '-'}</td>
                        <td>{r.check_out || '-'}</td>
                        <td>{r.status}</td>
                        <td>{r.working_hours ?? 0}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'leave' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <label className="text-sm text-slate-600">Employee role:</label>
                <select
                  className="glass px-3 py-2 rounded-xl text-sm"
                  value={attendanceRoleFilter}
                  onChange={(e) => setAttendanceRoleFilter(e.target.value as any)}
                >
                  <option value="hr">HR</option>
                  <option value="payroll_officer">Payroll Officer</option>
                  <option value="employee">Employee</option>
                  <option value="all">All</option>
                </select>
              </div>
              <button onClick={() => loadLeaves(attendanceRoleFilter !== 'all' ? attendanceRoleFilter : undefined)} className="rounded-xl bg-slate-900 text-white px-3 py-2 text-sm">Refresh</button>
            </div>
            <div className="premium-card">
              <div className="space-y-3">
                {leaveLoading ? (
                  <p className="text-sm text-slate-500">Loading...</p>
                ) : leaveRows.length === 0 ? (
                  <p className="text-sm text-slate-500">No pending leave requests</p>
                ) : (
                  leaveRows.map((l) => (
                    <div key={l.id} className="flex items-center justify-between border rounded-xl p-3 bg-white/80">
                      <div>
                        <p className="font-semibold text-slate-900">{l.first_name} {l.last_name} • {l.employee_code}</p>
                        <p className="text-xs text-slate-600">{l.leave_type_name} • {new Date(l.start_date).toLocaleDateString()} - {new Date(l.end_date).toLocaleDateString()} ({l.total_days} days)</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleLeaveAction(l.id, 'Approved')} className="text-xs rounded-xl bg-green-600 text-white px-3 py-1.5">Approve</button>
                        <button onClick={() => handleLeaveAction(l.id, 'Rejected')} className="text-xs rounded-xl bg-red-600 text-white px-3 py-1.5">Reject</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {tab === 'payroll' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <label className="text-sm text-slate-600">Payrun:</label>
              <select
                className="glass px-3 py-2 rounded-xl text-sm"
                value={selectedPayrun ?? ''}
                onChange={(e) => setSelectedPayrun(e.target.value ? Number(e.target.value) : null)}
              >
                {payrunOptions.map((p) => (
                  <option key={p.id} value={p.id}>{MONTH_NAMES[(p.month - 1 + 12) % 12]} {p.year}</option>
                ))}
                <option value="">Unassigned</option>
              </select>
              <button onClick={loadPayroll} className="rounded-xl bg-slate-900 text-white px-3 py-2 text-sm">Refresh</button>
              {selectedPayrun && (
                <div className="ml-auto flex gap-2">
                  <button onClick={() => handlePayrunAction('approve')} className="rounded-xl bg-blue-600 text-white px-3 py-2 text-sm">Approve</button>
                  <button onClick={() => handlePayrunAction('reject')} className="rounded-xl bg-red-600 text-white px-3 py-2 text-sm">Reject</button>
                  <button onClick={() => handlePayrunAction('lock')} className="rounded-xl bg-slate-600 text-white px-3 py-2 text-sm">Lock</button>
                </div>
              )}
            </div>
            <div className="premium-card overflow-x-auto">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Code</th>
                    <th>Department</th>
                    <th>Month</th>
                    <th>Net</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payrollLoading ? (
                    <tr><td colSpan={6} className="text-center text-sm text-slate-500">Loading...</td></tr>
                  ) : payrollRows.length === 0 ? (
                    <tr><td colSpan={6} className="text-center text-sm text-slate-500">No payroll records</td></tr>
                  ) : (
                    payrollRows.map((r) => (
                      <tr key={r.id}>
                        <td className="font-semibold">{r.first_name} {r.last_name}</td>
                        <td>{r.employee_code}</td>
                        <td>{r.department ?? '-'}</td>
                        <td>{MONTH_NAMES[(r.month - 1 + 12) % 12]} {r.year}</td>
                        <td>₹{Number(r.net_salary || 0).toLocaleString()}</td>
                        <td>{r.status}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'employees' && (
          <div className="premium-card overflow-x-auto">
            <div className="flex items-center justify-between mb-3">
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or code"
                className="glass px-3 py-2 rounded-xl text-sm w-64"
              />
              <button onClick={loadEmployees} className="rounded-xl bg-slate-900 text-white px-3 py-2 text-sm">Refresh</button>
            </div>
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Code</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {employeesLoading ? (
                  <tr><td colSpan={5} className="text-center text-sm text-slate-500">Loading...</td></tr>
                ) : (
                  employees
                    .filter((e) =>
                      !searchTerm ||
                      `${e.first_name} ${e.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      e.employee_code.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((e) => (
                      <tr key={e.id}>
                        <td className="font-semibold">{e.first_name} {e.last_name}</td>
                        <td>{e.employee_code}</td>
                        <td>{e.department ?? '-'}</td>
                        <td>{e.status}</td>
                        <td>{e.user_role}</td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'roles' && (
          <div className="space-y-6">
            <div className="premium-card">
              <h3 className="text-sm font-semibold mb-3">Change Roles</h3>
              <div className="space-y-3">
                {employees.map((e) => (
                  <div key={e.id} className="flex items-center justify-between border rounded-xl p-3 bg-white/80">
                    <div>
                      <p className="font-semibold">{e.first_name} {e.last_name} • {e.employee_code}</p>
                      <p className="text-xs text-slate-500">Current: {e.user_role}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        className="glass px-3 py-2 rounded-xl text-sm"
                        value={roleUpdates[e.id] ?? e.user_role}
                        onChange={(evt) => setRoleUpdates((prev) => ({ ...prev, [e.id]: evt.target.value }))}
                      >
                        {allowedRoleOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleSaveRole(e.id)}
                        disabled={roleSavingId === e.id}
                        className="rounded-xl bg-blue-600 text-white px-3 py-2 text-sm disabled:opacity-60"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="premium-card">
              <h3 className="text-sm font-semibold mb-3">Create New Employee</h3>
              <div className="grid gap-3 md:grid-cols-2">
                <input className="glass px-3 py-2 rounded-xl text-sm" placeholder="First name" value={newEmployee.firstName} onChange={(e) => setNewEmployee({ ...newEmployee, firstName: e.target.value })} />
                <input className="glass px-3 py-2 rounded-xl text-sm" placeholder="Last name" value={newEmployee.lastName} onChange={(e) => setNewEmployee({ ...newEmployee, lastName: e.target.value })} />
                <input className="glass px-3 py-2 rounded-xl text-sm" placeholder="Email" value={newEmployee.email} onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })} />
                <input className="glass px-3 py-2 rounded-xl text-sm" placeholder="Password" type="password" value={newEmployee.password} onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })} />
                <select className="glass px-3 py-2 rounded-xl text-sm" value={newEmployee.role} onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}>
                  {allowedRoleOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="mt-3">
                <button onClick={handleCreateEmployee} className="rounded-xl bg-green-600 text-white px-4 py-2 text-sm">Create</button>
              </div>
            </div>
          </div>
        )}

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard
            icon={<Users className="h-6 w-6" />}
            label="Total Employees"
            value={stats.totalEmployees}
            sublabel={`${stats.activeEmployees} active`}
            color="from-blue-500 to-blue-600"
          />
          <StatCard
            icon={<CheckCircle className="h-6 w-6" />}
            label="Attendance Today"
            value={`${stats.attendanceRate}%`}
            sublabel={`${stats.presentToday}/${stats.activeEmployees} present`}
            color="from-green-500 to-green-600"
          />
          <StatCard
            icon={<Calendar className="h-6 w-6" />}
            label="Leave Requests"
            value={stats.pendingLeaves}
            sublabel="Pending approval"
            color="from-orange-500 to-orange-600"
          />
          <StatCard
            icon={<DollarSign className="h-6 w-6" />}
            label="Monthly Payroll"
            value={`₹${(stats.monthlyPayroll / 1000000).toFixed(2)}M`}
            sublabel="This month"
            color="from-purple-500 to-purple-600"
          />
        </div>

        {/* Quick Admin Actions */}
        <div className="grid md:grid-cols-6 gap-4 mb-6">
          {[
            { icon: Users, label: 'Employees', route: '/employees', color: 'from-blue-500 to-blue-600' },
            { icon: Calendar, label: 'Attendance', route: '/attendance', color: 'from-green-500 to-green-600' },
            { icon: FileText, label: 'Leaves', route: '/leave', color: 'from-purple-500 to-purple-600' },
            { icon: DollarSign, label: 'Payroll', route: '/payroll', color: 'from-orange-500 to-orange-600' },
            { icon: Database, label: 'Departments', route: '/departments', color: 'from-pink-500 to-pink-600' },
            { icon: Settings, label: 'Settings', route: '/settings', color: 'from-slate-500 to-slate-600' },
          ].map((action, idx) => (
            <motion.button
              key={idx}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push(action.route)}
              className="premium-card p-4 hover:shadow-xl transition-all group"
            >
              <div className={`bg-gradient-to-br ${action.color} p-3 rounded-xl text-white group-hover:scale-110 transition-transform shadow-lg mx-auto w-fit mb-2`}>
                <action.icon className="h-5 w-5" />
              </div>
              <p className="font-semibold text-slate-900 text-sm text-center">{action.label}</p>
            </motion.button>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="premium-card lg:col-span-2"
          >
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <span>Recent Activity</span>
            </h3>
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 glass rounded-xl hover:bg-white/80 transition-all">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      activity.type === 'success' ? 'bg-green-100' :
                      activity.type === 'warning' ? 'bg-orange-100' : 'bg-blue-100'
                    }`}>
                      {activity.type === 'success' ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : activity.type === 'warning' ? (
                        <AlertCircle className="h-4 w-4 text-orange-600" />
                      ) : (
                        <Activity className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        <span className="text-blue-600">{activity.user}</span> {activity.action}
                      </p>
                      <p className="text-xs text-slate-500">{activity.entity} • {activity.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* System Alerts */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="premium-card"
          >
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <span>System Alerts</span>
            </h3>
            <div className="space-y-3">
              {systemAlerts.map((alert) => (
                <div key={alert.id} className={`p-3 rounded-xl border-2 ${
                  alert.type === 'warning' ? 'bg-orange-50 border-orange-200' :
                  alert.type === 'success' ? 'bg-green-50 border-green-200' :
                  'bg-blue-50 border-blue-200'
                }`}>
                  <div className="flex items-start space-x-2">
                    {alert.type === 'warning' ? (
                      <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    ) : alert.type === 'success' ? (
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Activity className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{alert.message}</p>
                      <p className="text-xs text-slate-500 mt-1">{alert.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Department Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="premium-card mb-6"
        >
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            <span>Department Analytics</span>
          </h3>
          <div className="overflow-x-auto">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Employees</th>
                  <th>Avg Salary</th>
                  <th>Attendance Rate</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {departmentStats.map((dept, idx) => (
                  <motion.tr
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <td className="font-semibold">{dept.name}</td>
                    <td>{dept.employees}</td>
                    <td>₹{dept.avgSalary.toLocaleString()}</td>
                    <td>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
                            style={{ width: `${dept.attendanceRate}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold">{dept.attendanceRate}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${
                        dept.attendanceRate >= 95 ? 'badge-success' :
                        dept.attendanceRate >= 90 ? 'badge-warning' : 'badge-danger'
                      }`}>
                        {dept.attendanceRate >= 95 ? 'Excellent' :
                         dept.attendanceRate >= 90 ? 'Good' : 'Needs Attention'}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Advanced Analytics Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Attendance Trend Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="premium-card"
          >
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span>Monthly Attendance Trend</span>
            </h3>
            <div className="space-y-4">
              {[
                { month: 'Jan', percentage: 94, employees: 136 },
                { month: 'Feb', percentage: 92, employees: 133 },
                { month: 'Mar', percentage: 96, employees: 139 },
                { month: 'Apr', percentage: 93, employees: 135 },
                { month: 'May', percentage: 95, employees: 138 },
                { month: 'Jun', percentage: 91, employees: 132 },
              ].map((data, idx) => (
                <motion.div
                  key={data.month}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-700 w-12">{data.month}</span>
                    <div className="flex-1 mx-4">
                      <div className="relative h-8 bg-gradient-to-r from-slate-100 to-slate-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${data.percentage}%` }}
                          transition={{ duration: 1, delay: idx * 0.1 }}
                          className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 flex items-center justify-end pr-2"
                        >
                          <span className="text-xs font-bold text-white drop-shadow-lg">{data.percentage}%</span>
                        </motion.div>
                      </div>
                    </div>
                    <span className="text-sm text-slate-600 w-20 text-right">{data.employees} emp</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Department Distribution */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="premium-card"
          >
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span>Employee Distribution</span>
            </h3>
            <div className="space-y-4">
              {departmentStats.map((dept, idx) => {
                const totalEmployees = departmentStats.reduce((sum, d) => sum + d.employees, 0);
                const percentage = Math.round((dept.employees / totalEmployees) * 100);
                return (
                  <motion.div
                    key={dept.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-700">{dept.name}</span>
                      <span className="text-sm text-slate-600">{dept.employees} ({percentage}%)</span>
                    </div>
                    <div className="relative h-3 bg-slate-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, delay: idx * 0.1 }}
                        className={`h-full bg-gradient-to-r ${
                          idx === 0 ? 'from-blue-500 to-blue-600' :
                          idx === 1 ? 'from-purple-500 to-purple-600' :
                          idx === 2 ? 'from-pink-500 to-pink-600' :
                          idx === 3 ? 'from-orange-500 to-orange-600' :
                          'from-green-500 to-green-600'
                        }`}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Payroll Analytics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="premium-card mb-6"
        >
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <span>Payroll Analytics - Last 6 Months</span>
          </h3>
          <div className="flex items-end justify-between space-x-2 h-64">
            {[
              { month: 'Jan', amount: 9200000 },
              { month: 'Feb', amount: 9400000 },
              { month: 'Mar', amount: 10100000 },
              { month: 'Apr', amount: 9800000 },
              { month: 'May', amount: 10500000 },
              { month: 'Jun', amount: 10850000 },
            ].map((data, idx) => {
              const maxAmount = 11000000;
              const heightPercentage = (data.amount / maxAmount) * 100;
              return (
                <div key={data.month} className="flex-1 flex flex-col items-center space-y-2">
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: `${heightPercentage}%`, opacity: 1 }}
                    transition={{ duration: 1, delay: idx * 0.1 }}
                    className="w-full bg-gradient-to-t from-green-600 via-green-500 to-green-400 rounded-t-xl relative group cursor-pointer hover:from-green-700 hover:via-green-600 hover:to-green-500 transition-all"
                  >
                    <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap font-semibold shadow-lg">
                      ₹{(data.amount / 100000).toFixed(1)}L
                    </div>
                  </motion.div>
                  <span className="text-xs font-bold text-slate-600">{data.month}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="glass p-4 rounded-xl">
              <p className="text-xs text-slate-600 mb-1">Average Monthly</p>
              <p className="text-xl font-black text-slate-900">₹98.5L</p>
            </div>
            <div className="glass p-4 rounded-xl">
              <p className="text-xs text-slate-600 mb-1">Growth Rate</p>
              <p className="text-xl font-black text-green-600">+18%</p>
            </div>
            <div className="glass p-4 rounded-xl">
              <p className="text-xs text-slate-600 mb-1">Total (6 months)</p>
              <p className="text-xl font-black text-slate-900">₹5.98Cr</p>
            </div>
          </div>
        </motion.div>

        {/* Leave Analytics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="premium-card"
        >
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-purple-600" />
            <span>Leave Analytics - Current Month</span>
          </h3>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { type: 'Sick Leave', count: 23, color: 'from-red-500 to-red-600', percentage: 35 },
              { type: 'Casual Leave', count: 31, color: 'from-blue-500 to-blue-600', percentage: 47 },
              { type: 'Annual Leave', count: 8, color: 'from-purple-500 to-purple-600', percentage: 12 },
              { type: 'Other', count: 4, color: 'from-orange-500 to-orange-600', percentage: 6 },
            ].map((leave, idx) => (
              <motion.div
                key={leave.type}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="text-center"
              >
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="#e2e8f0"
                      strokeWidth="16"
                      fill="none"
                    />
                    <motion.circle
                      initial={{ strokeDashoffset: 352 }}
                      animate={{ strokeDashoffset: 352 - (352 * leave.percentage) / 100 }}
                      transition={{ duration: 1.5, delay: idx * 0.1 }}
                      cx="64"
                      cy="64"
                      r="56"
                      stroke={`url(#gradient-${idx})`}
                      strokeWidth="16"
                      fill="none"
                      strokeDasharray="352"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-2xl font-black text-slate-900">{leave.count}</p>
                      <p className="text-xs text-slate-500">{leave.percentage}%</p>
                    </div>
                  </div>
                </div>
                <p className="text-sm font-semibold text-slate-700">{leave.type}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sublabel, color }: any) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="premium-card relative overflow-hidden"
    >
      <div className={`bg-gradient-to-br ${color} w-12 h-12 rounded-xl flex items-center justify-center text-white mb-3 shadow-lg`}>
        {icon}
      </div>
      <p className="text-sm text-slate-600 font-semibold mb-1">{label}</p>
      <p className="text-3xl font-black text-slate-900 mb-1">{value}</p>
      <p className="text-xs text-slate-500">{sublabel}</p>
      <motion.div
        className={`absolute -bottom-2 -right-2 w-24 h-24 bg-gradient-to-br ${color} opacity-10 rounded-full blur-2xl`}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
    </motion.div>
  );
}
