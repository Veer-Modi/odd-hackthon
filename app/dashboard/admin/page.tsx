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
  basic_salary?: number | string | null;
  allowances?: number | string | null;
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
    totalEmployees: 0,
    activeEmployees: 0,
    totalDepartments: 0,
    monthlyPayroll: 0,
    presentToday: 0,
    attendanceRate: 0,
    pendingLeaves: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [systemAlerts, setSystemAlerts] = useState<any[]>([]);
  const [departmentStats, setDepartmentStats] = useState<any[]>([]);
  const [attendanceTrend, setAttendanceTrend] = useState<any[]>([]);
  const [payrollTrend, setPayrollTrend] = useState<any[]>([]);
  const [leaveBreakdown, setLeaveBreakdown] = useState<any[]>([]);
  const [attendanceRows, setAttendanceRows] = useState<AttendanceRow[]>([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceRoleFilter, setAttendanceRoleFilter] = useState<'hr' | 'payroll_officer' | 'employee' | 'all'>('all');
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
  const [editingCompId, setEditingCompId] = useState<number | null>(null);
  const [compBasic, setCompBasic] = useState<string>('');
  const [compAllowances, setCompAllowances] = useState<string>('');
  const [compSaving, setCompSaving] = useState<boolean>(false);
  const [nightPendingCount, setNightPendingCount] = useState<number>(0);
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementMessage, setAnnouncementMessage] = useState('');
  const [announcementType, setAnnouncementType] = useState<'info'|'warning'|'success'|'error'>('info');
  const [postingAnnouncement, setPostingAnnouncement] = useState(false);
  const [recentAnnouncements, setRecentAnnouncements] = useState<any[]>([]);
  const getDefaultMonth = () => {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${d.getFullYear()}-${m}`;
  };
  const [summaryMonth, setSummaryMonth] = useState<string>(getDefaultMonth());
  const [summaryRole, setSummaryRole] = useState<'all'|'employee'|'hr'|'payroll_officer'>('all');
  const [summaryRows, setSummaryRows] = useState<any[]>([]);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [roleHolders, setRoleHolders] = useState<any[]>([]);
  const [assignRole, setAssignRole] = useState<{ employeeId: string; role: 'hr'|'payroll_officer'; department: string; demotePrevious: boolean }>({ employeeId: '', role: 'hr', department: '', demotePrevious: true });
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

  const formatDateTime = (value?: string | null) => (value ? new Date(value).toLocaleString('en-IN') : '—');
  const formatMonthLabel = (month: number, year: number) => `${MONTH_NAMES[(month - 1 + 12) % 12]} ${year}`;
  const formatCurrency = (value: number) => `₹${Number(value || 0).toLocaleString('en-IN')}`;
  const summarizeDetails = (details: any) => {
    if (!details) {
      return null;
    }
    if (typeof details === 'string') {
      const trimmed = details.trim();
      if (!trimmed) {
        return null;
      }
      try {
        const parsed = JSON.parse(trimmed);
        if (typeof parsed === 'object' && parsed !== null) {
          return Object.entries(parsed)
            .map(([key, value]) => `${key}: ${String(value)}`)
            .slice(0, 3)
            .join(', ');
        }
        return trimmed;
      } catch (error) {
        return trimmed;
      }
    }
    if (typeof details === 'object') {
      return Object.entries(details)
        .map(([key, value]) => `${key}: ${String(value)}`)
        .slice(0, 3)
        .join(', ');
    }
    return String(details);
  };

  const loadDashboard = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }
    try {
      const response = await fetch('/api/dashboard/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error('Failed to load dashboard data');
      }
      const data = await response.json();
      const statsPayload = data?.stats ?? {};
      setStats({
        totalEmployees: Number(statsPayload.totalEmployees ?? 0),
        activeEmployees: Number(statsPayload.activeEmployees ?? 0),
        totalDepartments: Number(statsPayload.totalDepartments ?? 0),
        monthlyPayroll: Number(statsPayload.monthlyPayroll ?? 0),
        presentToday: Number(statsPayload.presentToday ?? 0),
        attendanceRate: Number(statsPayload.attendanceRate ?? 0),
        pendingLeaves: Number(statsPayload.pendingLeaves ?? 0),
      });
      const activityRows = Array.isArray(data?.recentActivity) ? data.recentActivity : [];
      const mappedActivity = activityRows.map((row: any) => {
        const action = String(row?.action ?? '').trim();
        const normalized = action.toLowerCase();
        let type: 'success' | 'warning' | 'error' | 'info' = 'info';
        if (normalized.includes('approve') || normalized.includes('login') || normalized.includes('create')) {
          type = 'success';
        } else if (normalized.includes('reject') || normalized.includes('fail') || normalized.includes('error')) {
          type = 'error';
        } else if (normalized.includes('pending') || normalized.includes('update')) {
          type = 'warning';
        }
        return {
          id: row?.id ?? action,
          user: row?.userEmail ?? 'System',
          action: action || 'Activity',
          entity: row?.entity ?? '',
          time: formatDateTime(row?.createdAt),
          type,
          details: summarizeDetails(row?.details),
        };
      });
      setRecentActivity(mappedActivity);

      const alertRows = Array.isArray(data?.systemAlerts) ? data.systemAlerts : [];
      const mappedAlerts = alertRows.map((alert: any) => ({
        id: alert?.id ?? alert?.title ?? alert?.message,
        title: alert?.title ?? 'Alert',
        message: alert?.message ?? '',
        type: alert?.type ?? 'info',
        time: formatDateTime(alert?.createdAt),
      }));
      setSystemAlerts(mappedAlerts);

      const deptRows = Array.isArray(data?.departmentStats) ? data.departmentStats : [];
      const mappedDepartments = deptRows.map((dept: any) => ({
        name: dept?.name ?? 'Unassigned',
        employees: Number(dept?.employees ?? 0),
        avgSalary: Number(dept?.avgSalary ?? 0),
        activeEmployees: Number(dept?.activeEmployees ?? 0),
      }));
      setDepartmentStats(mappedDepartments);

      const attendanceRows = Array.isArray(data?.attendanceTrend) ? data.attendanceTrend : [];
      const mappedAttendance = attendanceRows.map((row: any) => {
        const monthNum = Number(row?.month ?? 0);
        const yearNum = Number(row?.year ?? new Date().getFullYear());
        const present = Number(row?.presentCount ?? 0);
        const total = Number(row?.totalRecords ?? 0);
        const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
        const label = monthNum >= 1 && monthNum <= 12 ? formatMonthLabel(monthNum, yearNum) : String(yearNum);
        return {
          key: `${yearNum}-${monthNum}`,
          label,
          present,
          total,
          percentage,
        };
      });
      setAttendanceTrend(mappedAttendance);

      const payrollRows = Array.isArray(data?.payrollTrend) ? data.payrollTrend : [];
      const mappedPayroll = payrollRows.map((row: any) => {
        const monthNum = Number(row?.month ?? 0);
        const yearNum = Number(row?.year ?? new Date().getFullYear());
        const amount = Number(row?.total ?? 0);
        const label = monthNum >= 1 && monthNum <= 12 ? formatMonthLabel(monthNum, yearNum) : String(yearNum);
        return {
          key: `${yearNum}-${monthNum}`,
          label,
          amount,
        };
      });
      setPayrollTrend(mappedPayroll);

      const leaveRows = Array.isArray(data?.leaveBreakdown) ? data.leaveBreakdown : [];
      const totalLeaveCount = leaveRows.reduce((sum: number, item: any) => sum + Number(item?.count ?? 0), 0);
      const mappedLeave = leaveRows.map((item: any) => {
        const count = Number(item?.count ?? 0);
        const percentage = totalLeaveCount > 0 ? Math.round((count / totalLeaveCount) * 100) : 0;
        return {
          type: item?.type ?? 'Other',
          count,
          percentage,
        };
      });
      setLeaveBreakdown(mappedLeave);
    } catch (error) {
      console.error('Failed to load admin dashboard data', error);
    }
  }, []);

  const loadNightPendingCount = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch('/api/night-shift?status=Pending', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return;
      const data = await res.json();
      setNightPendingCount(Array.isArray(data) ? data.length : 0);
    } catch {}
  }, []);

  const loadAnnouncements = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch('/api/announcements', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return;
      const data = await res.json();
      setRecentAnnouncements(Array.isArray(data) ? data.slice(0, 10) : []);
    } catch {}
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!userData || !token) {
      router.push('/login');
      return;
    }

    setUser(JSON.parse(userData));
    loadDashboard().finally(() => setLoading(false));
  }, [router, loadDashboard]);

  const loadAttendance = useCallback(async () => {
    try {
      setAttendanceLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;
      const params = new URLSearchParams();
      if (attendanceRoleFilter && attendanceRoleFilter !== 'all') {
        params.set('role', attendanceRoleFilter);
      }

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
      if (attendanceRoleFilter && attendanceRoleFilter !== 'all') {
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

  const loadSummary = useCallback(async () => {
    try {
      setSummaryLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;
      const params = new URLSearchParams();
      params.set('month', summaryMonth);
      if (summaryRole !== 'all') params.set('role', summaryRole);
      const res = await fetch(`/api/attendance/summary?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load summary');
      const data = await res.json();
      setSummaryRows(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setErrorMessage(e?.message || 'Failed to load summary');
    } finally {
      setSummaryLoading(false);
    }
  }, [summaryMonth, summaryRole]);

  const loadRoleHolders = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch('/api/admin/roles', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to load role holders');
      const data = await res.json();
      setRoleHolders(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setErrorMessage(e?.message || 'Failed to load role holders');
    }
  }, []);

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
      loadSummary();
    } else if (tab === 'leave') {
      loadLeaves(attendanceRoleFilter !== 'all' ? attendanceRoleFilter : undefined);

    } else if (tab === 'payroll') {
      loadPayruns();
      loadPayroll();
    } else if (tab === 'employees' || tab === 'roles') {
      loadEmployees();
      if (tab === 'roles') loadRoleHolders();
    } else if (tab === 'overview') {
      loadNightPendingCount();
      loadAnnouncements();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, attendanceRoleFilter, selectedPayrun, summaryMonth, summaryRole]);

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
            {tab === 'overview' && nightPendingCount > 0 && (
              <div className="hidden md:flex items-center text-xs font-semibold px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200">
                Night requests pending: {nightPendingCount}
              </div>
            )}
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
                    <p className="text-sm text-slate-600 mb-1">Active Employees</p>
                    <p className="text-xl font-bold text-slate-900">{stats.activeEmployees}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Departments</p>
                    <p className="text-xl font-bold text-slate-900">{stats.totalDepartments}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Attendance Rate</p>
                    <p className="text-xl font-bold text-slate-900">{stats.attendanceRate}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Pending Leaves</p>
                    <p className="text-xl font-bold text-slate-900">{stats.pendingLeaves}</p>
                  </div>
                </div>
              </div>
            </motion.div>

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

            {/* Announcements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="premium-card mb-6"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  <span>Announcements</span>
                </h3>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="space-y-3">
                    <input className="glass px-3 py-2 rounded-xl text-sm w-full" placeholder="Title" value={announcementTitle} onChange={(e) => setAnnouncementTitle(e.target.value)} />
                    <textarea className="glass px-3 py-2 rounded-xl text-sm w-full min-h-[96px]" placeholder="Message" value={announcementMessage} onChange={(e) => setAnnouncementMessage(e.target.value)} />
                    <div className="flex items-center gap-3">
                      <label className="text-sm text-slate-600">Type</label>
                      <select className="glass px-3 py-2 rounded-xl text-sm" value={announcementType} onChange={(e) => setAnnouncementType(e.target.value as any)}>
                        <option value="info">Info</option>
                        <option value="warning">Warning</option>
                        <option value="success">Success</option>
                        <option value="error">Error</option>
                      </select>
                      <button
                        onClick={async () => {
                          const token = localStorage.getItem('token');
                          if (!token) return;
                          if (!announcementTitle.trim() || !announcementMessage.trim()) { alert('Enter title and message'); return; }
                          try {
                            setPostingAnnouncement(true);
                            const res = await fetch('/api/announcements', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                              body: JSON.stringify({ title: announcementTitle.trim(), message: announcementMessage.trim(), type: announcementType })
                            });
                            const out = await res.json();
                            if (!res.ok) throw new Error(out?.error || 'Failed');
                            setAnnouncementTitle('');
                            setAnnouncementMessage('');
                            await loadAnnouncements();
                            alert('Announcement sent');
                          } catch (e: any) {
                            alert(e?.message || 'Failed to send announcement');
                          } finally {
                            setPostingAnnouncement(false);
                          }
                        }}
                        disabled={postingAnnouncement}
                        className="ml-auto rounded-xl bg-blue-600 text-white px-3 py-2 text-sm"
                      >
                        {postingAnnouncement ? 'Posting...' : 'Post Announcement'}
                      </button>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-2">Recent</p>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {recentAnnouncements.length === 0 ? (
                      <p className="text-xs text-slate-500">No announcements yet.</p>
                    ) : (
                      recentAnnouncements.map((a: any) => (
                        <div key={a.id} className="p-3 rounded-xl bg-white/80 border">
                          <p className="text-sm font-semibold text-slate-900">{a.title}</p>
                          <p className="text-xs text-slate-600">{a.message}</p>
                          <p className="text-[10px] text-slate-400 mt-1">{a.created_at ? new Date(a.created_at).toLocaleString() : ''}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

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
                {departmentStats.length === 0 ? (
                  <p className="text-sm text-slate-500">No department data available yet.</p>
                ) : (
                  <table className="premium-table">
                    <thead>
                      <tr>
                        <th>Department</th>
                        <th>Total Employees</th>
                        <th>Active Employees</th>
                        <th>Avg Salary</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {departmentStats.map((dept, idx) => {
                        const ratio = dept.employees > 0 ? Math.round((dept.activeEmployees / dept.employees) * 100) : 0;
                        return (
                          <motion.tr
                            key={dept.name ?? idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                          >
                            <td className="font-semibold">{dept.name}</td>
                            <td>{dept.employees}</td>
                            <td>
                              <div className="flex items-center space-x-2">
                                <div className="w-24 bg-slate-200 rounded-full h-2">
                                  <div
                                    className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
                                    style={{ width: `${ratio}%` }}
                                  />
                                </div>
                                <span className="text-sm font-semibold">{dept.activeEmployees}</span>
                              </div>
                            </td>
                            <td>{formatCurrency(dept.avgSalary)}</td>
                            <td>
                              <span className={`badge ${
                                ratio >= 90 ? 'badge-success' : ratio >= 70 ? 'badge-warning' : 'badge-danger'
                              }`}>
                                {ratio >= 90 ? 'Stable' : ratio >= 70 ? 'Monitor' : 'Attention'}
                              </span>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
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
                {attendanceTrend.length === 0 ? (
                  <p className="text-sm text-slate-500">Not enough attendance data yet.</p>
                ) : (
                  <div className="space-y-4">
                    {attendanceTrend.map((data, idx) => (
                      <motion.div
                        key={data.key ?? idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-slate-700 w-20">{data.label}</span>
                          <div className="flex-1 mx-4">
                            <div className="relative h-8 bg-gradient-to-r from-slate-100 to-slate-200 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(data.percentage, 100)}%` }}
                                transition={{ duration: 1, delay: idx * 0.1 }}
                                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 flex items-center justify-end pr-2"
                              >
                                <span className="text-xs font-bold text-white drop-shadow-lg">{data.percentage}%</span>
                              </motion.div>
                            </div>
                          </div>
                          <span className="text-sm text-slate-600 w-28 text-right">{data.present}/{data.total} present</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
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
                {departmentStats.length === 0 ? (
                  <p className="text-sm text-slate-500">No distribution data available.</p>
                ) : (
                  <div className="space-y-4">
                    {departmentStats.map((dept, idx) => {
                      const totalEmployees = departmentStats.reduce((sum, d) => sum + d.employees, 0) || 1;
                      const percentage = Math.round((dept.employees / totalEmployees) * 100);
                      return (
                        <motion.div
                          key={dept.name ?? idx}
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
                                idx % 5 === 0 ? 'from-blue-500 to-blue-600' :
                                idx % 5 === 1 ? 'from-purple-500 to-purple-600' :
                                idx % 5 === 2 ? 'from-pink-500 to-pink-600' :
                                idx % 5 === 3 ? 'from-orange-500 to-orange-600' :
                                'from-green-500 to-green-600'
                              }`}
                            />
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
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
              {payrollTrend.length === 0 ? (
                <p className="text-sm text-slate-500">Payroll data will appear after the first payrun.</p>
              ) : (
                <>
                  <div className="flex items-end justify-between space-x-2 h-64">
                    {(() => {
                      const maxAmount = Math.max(...payrollTrend.map((item) => item.amount), 1);
                      return payrollTrend.map((data, idx) => {
                        const heightPercentage = Math.max((data.amount / maxAmount) * 100, 4);
                        return (
                          <div key={data.key ?? idx} className="flex-1 flex flex-col items-center space-y-2">
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: `${heightPercentage}%`, opacity: 1 }}
                              transition={{ duration: 1, delay: idx * 0.1 }}
                              className="w-full bg-gradient-to-t from-green-600 via-green-500 to-green-400 rounded-t-xl relative group cursor-pointer hover:from-green-700 hover:via-green-600 hover:to-green-500 transition-all"
                            >
                              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap font-semibold shadow-lg">
                                {formatCurrency(data.amount)}
                              </div>
                            </motion.div>
                            <span className="text-xs font-bold text-slate-600">{data.label}</span>
                          </div>
                        );
                      });
                    })()}
                  </div>
                  <div className="mt-6 grid grid-cols-3 gap-4">
                    {(() => {
                      const total = payrollTrend.reduce((sum, item) => sum + item.amount, 0);
                      const avg = payrollTrend.length ? total / payrollTrend.length : 0;
                      const first = payrollTrend[0]?.amount ?? 0;
                      const last = payrollTrend[payrollTrend.length - 1]?.amount ?? 0;
                      const growth = first === 0 ? 0 : Math.round(((last - first) / first) * 100);
                      return (
                        <>
                          <div className="glass p-4 rounded-xl">
                            <p className="text-xs text-slate-600 mb-1">Average Monthly</p>
                            <p className="text-xl font-black text-slate-900">{formatCurrency(avg)}</p>
                          </div>
                          <div className="glass p-4 rounded-xl">
                            <p className="text-xs text-slate-600 mb-1">Growth Rate</p>
                            <p className={`text-xl font-black ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {growth >= 0 ? '+' : ''}{growth}%
                            </p>
                          </div>
                          <div className="glass p-4 rounded-xl">
                            <p className="text-xs text-slate-600 mb-1">Total ({payrollTrend.length} months)</p>
                            <p className="text-xl font-black text-slate-900">{formatCurrency(total)}</p>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </>
              )}
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
              {leaveBreakdown.length === 0 ? (
                <p className="text-sm text-slate-500">No leave requests recorded this month.</p>
              ) : (
                <div className="grid md:grid-cols-4 gap-6">
                  {leaveBreakdown.map((leave, idx) => {
                    const colors = ['#ef4444', '#3b82f6', '#8b5cf6', '#f97316', '#10b981'];
                    const strokeColor = colors[idx % colors.length];
                    return (
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
                              animate={{ strokeDashoffset: 352 - (352 * Math.min(leave.percentage, 100)) / 100 }}
                              transition={{ duration: 1.2, delay: idx * 0.1 }}
                              cx="64"
                              cy="64"
                              r="56"
                              stroke={strokeColor}
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
                    );
                  })}
                </div>
              )}
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
                    <th>Department</th>
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
                        <td>{r.department ?? '-'}</td>
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
            <div className="premium-card">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <label className="text-sm text-slate-600">Month</label>
                  <input type="month" className="glass px-3 py-2 rounded-xl text-sm" value={summaryMonth} onChange={(e) => setSummaryMonth(e.target.value)} />
                  <label className="text-sm text-slate-600">Role</label>
                  <select className="glass px-3 py-2 rounded-xl text-sm" value={summaryRole} onChange={(e) => setSummaryRole(e.target.value as any)}>
                    <option value="all">All</option>
                    <option value="hr">HR</option>
                    <option value="payroll_officer">Payroll Officer</option>
                    <option value="employee">Employee</option>
                  </select>
                </div>
                <button onClick={loadSummary} className="rounded-xl bg-slate-900 text-white px-3 py-2 text-sm">Refresh</button>
              </div>
              <div className="overflow-x-auto">
                <table className="premium-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Department</th>
                      <th>Role</th>
                      <th>Days Worked</th>
                      <th>Night Days</th>
                      <th>Total Hours</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summaryLoading ? (
                      <tr><td colSpan={6} className="text-center text-sm text-slate-500">Loading...</td></tr>
                    ) : summaryRows.length === 0 ? (
                      <tr><td colSpan={6} className="text-center text-sm text-slate-500">No summary for selected month</td></tr>
                    ) : (
                      summaryRows.map((r: any, idx: number) => (
                        <tr key={idx}>
                          <td className="font-semibold">{r.first_name} {r.last_name}</td>
                          <td>{r.department ?? '-'}</td>
                          <td>{r.user_role}</td>
                          <td>{r.days_worked ?? 0}</td>
                          <td>{r.night_days ?? 0}</td>
                          <td>{Number(r.total_hours || 0).toFixed(2)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
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
                  <th>Basic Salary</th>
                  <th>Allowances</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employeesLoading ? (
                  <tr><td colSpan={8} className="text-center text-sm text-slate-500">Loading...</td></tr>
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
                        <td>
                          {editingCompId === e.id ? (
                            <input
                              type="number"
                              className="w-28 rounded-md border border-slate-200 px-2 py-1 text-sm"
                              value={compBasic}
                              onChange={(ev) => setCompBasic(ev.target.value)}
                            />
                          ) : (
                            e.basic_salary != null ? `₹${Number(e.basic_salary || 0).toLocaleString('en-IN')}` : '-'
                          )}
                        </td>
                        <td>
                          {editingCompId === e.id ? (
                            <input
                              type="number"
                              className="w-24 rounded-md border border-slate-200 px-2 py-1 text-sm"
                              value={compAllowances}
                              onChange={(ev) => setCompAllowances(ev.target.value)}
                            />
                          ) : (
                            e.allowances != null ? `₹${Number(e.allowances || 0).toLocaleString('en-IN')}` : '-'
                          )}
                        </td>
                        <td>
                          {editingCompId === e.id ? (
                            <div className="flex gap-2">
                              <button
                                disabled={compSaving}
                                onClick={async () => {
                                  const token = localStorage.getItem('token');
                                  if (!token) return;
                                  try {
                                    setCompSaving(true);
                                    const res = await fetch('/api/employees', {
                                      method: 'PUT',
                                      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                                      body: JSON.stringify({ id: e.id, basicSalary: compBasic ? Number(compBasic) : 0, allowances: compAllowances ? Number(compAllowances) : 0 }),
                                    });
                                    const out = await res.json();
                                    if (!res.ok) throw new Error(out?.error || 'Failed to update');
                                    setEditingCompId(null);
                                    setCompBasic('');
                                    setCompAllowances('');
                                    await loadEmployees();
                                  } catch (err: any) {
                                    alert(err?.message || 'Failed to update');
                                  } finally {
                                    setCompSaving(false);
                                  }
                                }}
                                className="rounded-xl bg-green-600 text-white px-3 py-1.5 text-xs"
                              >
                                {compSaving ? 'Saving...' : 'Save'}
                              </button>
                              <button
                                disabled={compSaving}
                                onClick={() => { setEditingCompId(null); setCompBasic(''); setCompAllowances(''); }}
                                className="rounded-xl bg-slate-200 text-slate-700 px-3 py-1.5 text-xs"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingCompId(e.id);
                                setCompBasic(String(e.basic_salary ?? ''));
                                setCompAllowances(String(e.allowances ?? ''));
                              }}
                              className="rounded-xl bg-blue-600 text-white px-3 py-1.5 text-xs"
                            >
                              Edit
                            </button>
                          )}
                        </td>
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
              <h3 className="text-sm font-semibold mb-3">Manage HR/Payroll Officers</h3>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <p className="text-xs text-slate-600 mb-2">Current Holders</p>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {roleHolders.length === 0 ? (
                      <p className="text-xs text-slate-500">No role holders found.</p>
                    ) : (
                      roleHolders.map((u: any) => (
                        <div key={`${u.user_id}-${u.role}`} className="border rounded-xl p-3 bg-white/80">
                          <p className="text-sm font-semibold">{u.first_name ?? ''} {u.last_name ?? ''} • {u.email}</p>
                          <p className="text-xs text-slate-600">{u.role} • {u.employee_code ?? ''} • {u.department ?? '-'}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-600 mb-2">Assign Role</p>
                  <div className="space-y-3">
                    <select className="glass px-3 py-2 rounded-xl text-sm w-full" value={assignRole.employeeId} onChange={(e) => setAssignRole({ ...assignRole, employeeId: e.target.value })}>
                      <option value="">Select Employee</option>
                      {employees.map((e) => (
                        <option key={e.id} value={String(e.id)}>{e.first_name} {e.last_name} • {e.employee_code}</option>
                      ))}
                    </select>
                    <div className="flex items-center gap-3 text-sm">
                      <label className="inline-flex items-center gap-1">
                        <input type="radio" name="assignRole" checked={assignRole.role === 'hr'} onChange={() => setAssignRole({ ...assignRole, role: 'hr' })} /> HR
                      </label>
                      <label className="inline-flex items-center gap-1">
                        <input type="radio" name="assignRole" checked={assignRole.role === 'payroll_officer'} onChange={() => setAssignRole({ ...assignRole, role: 'payroll_officer' })} /> Payroll Officer
                      </label>
                    </div>
                    <input className="glass px-3 py-2 rounded-xl text-sm w-full" placeholder="Department (optional)" value={assignRole.department} onChange={(e) => setAssignRole({ ...assignRole, department: e.target.value })} />
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={assignRole.demotePrevious} onChange={(e) => setAssignRole({ ...assignRole, demotePrevious: e.target.checked })} /> Demote previous holder(s)
                    </label>
                    <button
                      onClick={async () => {
                        const token = localStorage.getItem('token');
                        if (!token) return;
                        if (!assignRole.employeeId) { alert('Select employee'); return; }
                        try {
                          const res = await fetch('/api/admin/roles', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                            body: JSON.stringify({ role: assignRole.role, employeeId: Number(assignRole.employeeId), department: assignRole.department || undefined, demotePrevious: assignRole.demotePrevious }),
                          });
                          const out = await res.json();
                          if (!res.ok) throw new Error(out?.error || 'Failed');
                          await loadRoleHolders();
                          await loadEmployees();
                          setAssignRole({ employeeId: '', role: 'hr', department: '', demotePrevious: true });
                          alert('Role assignment updated');
                        } catch (e: any) {
                          alert(e?.message || 'Failed to assign role');
                        }
                      }}
                      className="rounded-xl bg-blue-600 text-white px-3 py-2 text-sm"
                    >
                      Assign
                    </button>
                  </div>
                </div>
              </div>
            </div>
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="premium-card mb-6"
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
