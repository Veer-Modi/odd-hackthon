'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  Calculator,
  CheckCircle,
  DollarSign,
  Loader,
  Users,
  Clock,
  Calendar,
  Power,
  PowerOff,
  MapPin,
} from 'lucide-react';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const toNumber = (value: unknown): number => {
  const parsed = Number.parseFloat(String(value ?? 0));
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatCurrency = (value: number): string =>
  `\u20B9${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

type Payrun = {
  id: number;
  month: number;
  year: number;
  status: string;
  total_employees: number;
  total_gross_salary: number | string;
  total_deductions: number | string;
  total_net_salary: number | string;
};

type PayrollRow = {
  id: number;
  first_name: string;
  last_name: string;
  employee_code: string;
  department?: string;
  net_salary: number | string;
  basic_salary: number | string;
  allowances: number | string;
  deductions: number | string;
  status?: string;
};

type ApprovalSummary = {
  message: string;
  status: string;
  payslips?: {
    total: number;
    emailsSent: number;
    emailsFailed: number;
  };
};

export default function PayrollOfficerDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [todayAttendance, setTodayAttendance] = useState<any>(null);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [location, setLocation] = useState<string>('');
  const [payruns, setPayruns] = useState<Payrun[]>([]);
  const [selectedPayrunId, setSelectedPayrunId] = useState<number | null>(null);
  const [payrollsByPayrun, setPayrollsByPayrun] = useState<Record<number, PayrollRow[]>>({});
  const [approvingAction, setApprovingAction] = useState<'approve' | 'reject' | 'lock' | null>(null);
  const [approvalResult, setApprovalResult] = useState<ApprovalSummary | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadingPayrollId, setLoadingPayrollId] = useState<number | null>(null);

  useEffect(() => {
    const init = async () => {
      const nextId = await loadPayruns();
      if (nextId) {
        await ensurePayrollsLoaded(nextId);
      }
      // Load today's attendance
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const todayRes = await fetch('/api/attendance/today', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (todayRes.ok) {
            setTodayAttendance(await todayRes.json());
          }
        } catch (err) {
          // ignore
        }
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const { latitude, longitude } = pos.coords;
              setLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
            },
            () => setLocation('Location not available')
          );
        }
      }
      setLoading(false);
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const handleCheckIn = async () => {
    setCheckingIn(true);
    const token = localStorage.getItem('token');
    try {
      let latitude: number | null = null;
      let longitude: number | null = null;
      let locationName = 'Office';
      if (navigator.geolocation) {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject));
        latitude = pos.coords.latitude;
        longitude = pos.coords.longitude;
        locationName = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      }
      const res = await fetch('/api/attendance/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ latitude, longitude, location: locationName }),
      });
      if (res.ok) {
        const todayRes = await fetch('/api/attendance/today', { headers: { Authorization: `Bearer ${token}` } });
        if (todayRes.ok) setTodayAttendance(await todayRes.json());
      } else {
        const err = await res.json();
        alert(err?.error || 'Check-in failed');
      }
    } catch (err) {
      alert('Failed to check in. Please try again.');
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    setCheckingOut(true);
    const token = localStorage.getItem('token');
    try {
      let latitude: number | null = null;
      let longitude: number | null = null;
      let locationName = 'Office';
      if (navigator.geolocation) {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject));
        latitude = pos.coords.latitude;
        longitude = pos.coords.longitude;
        locationName = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      }
      const res = await fetch('/api/attendance/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ latitude, longitude, location: locationName }),
      });
      if (res.ok) {
        const todayRes = await fetch('/api/attendance/today', { headers: { Authorization: `Bearer ${token}` } });
        if (todayRes.ok) setTodayAttendance(await todayRes.json());
      } else {
        const err = await res.json();
        alert(err?.error || 'Check-out failed');
      }
    } catch (err) {
      alert('Failed to check out. Please try again.');
    } finally {
      setCheckingOut(false);
    }
  };

  const loadPayruns = async (preferredId?: number | null): Promise<number | null> => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return null;
    }

    try {
      const response = await fetch('/api/payroll/payrun', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Unable to load payruns.');
      }

      const data: Payrun[] = await response.json();
      setPayruns(data);

      if (data.length === 0) {
        setSelectedPayrunId(null);
        setErrorMessage(null);
        return null;
      }

      let nextId = preferredId ?? selectedPayrunId ?? null;
      if (!nextId || !data.some((run) => run.id === nextId)) {
        const pending = data.find((run) => run.status === 'Pending Approval');
        nextId = (pending ?? data[0]).id;
      }

      setSelectedPayrunId(nextId);
      setErrorMessage(null);
      return nextId;
    } catch (error: any) {
      console.error('Failed to load payruns:', error);
      setErrorMessage(error?.message ?? 'Unable to load payruns.');
      setPayruns([]);
      setSelectedPayrunId(null);
      return null;
    }
  };

  const fetchPayrollsForPayrun = async (payrunId: number, force = false) => {
    if (!force && payrollsByPayrun[payrunId]) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      setLoadingPayrollId(payrunId);
      const response = await fetch(`/api/payroll/list?payrunId=${payrunId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Unable to load payroll entries.');
      }

      const data: PayrollRow[] = await response.json();
      setPayrollsByPayrun((prev) => ({ ...prev, [payrunId]: data }));
      setErrorMessage(null);
    } catch (error: any) {
      console.error('Failed to load payroll entries:', error);
      setErrorMessage(error?.message ?? 'Unable to load payroll entries.');
    } finally {
      setLoadingPayrollId(null);
    }
  };

  const ensurePayrollsLoaded = async (payrunId: number) => {
    await fetchPayrollsForPayrun(payrunId);
  };

  const handleSelectPayrun = async (payrunId: number) => {
    setSelectedPayrunId(payrunId);
    setApprovalResult(null);
    setErrorMessage(null);
    await ensurePayrollsLoaded(payrunId);
  };

  const handleApprovePayrun = async (action: 'approve' | 'reject' | 'lock') => {
    if (!selectedPayrunId) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    setApprovingAction(action);
    setErrorMessage(null);
    setApprovalResult(null);

    try {
      const response = await fetch('/api/payroll/payrun', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ payrunId: selectedPayrunId, action }),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result?.error ?? 'Failed to update payrun.');
        return;
      }

      setApprovalResult(result as ApprovalSummary);

      const nextId = await loadPayruns(selectedPayrunId);
      if (nextId) {
        await fetchPayrollsForPayrun(nextId, true);
      }
    } catch (error: any) {
      console.error('Failed to update payrun:', error);
      setErrorMessage(error?.message ?? 'Failed to update payrun.');
    } finally {
      setApprovingAction(null);
    }
  };

  const selectedPayrun = selectedPayrunId
    ? payruns.find((run) => run.id === selectedPayrunId) ?? null
    : null;

  const selectedPayrolls = selectedPayrunId
    ? payrollsByPayrun[selectedPayrunId] ?? []
    : [];

  const overview = useMemo(() => {
    const totalNet = payruns.reduce(
      (sum, run) => sum + toNumber(run.total_net_salary),
      0
    );
    const totalEmployees = payruns.reduce(
      (sum, run) => sum + (run.total_employees ?? 0),
      0
    );
    const pending = payruns.filter((run) => run.status !== 'Approved').length;
    const approved = payruns.filter((run) => run.status === 'Approved').length;

    return { totalNet, totalEmployees, pending, approved };
  }, [payruns]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
      <header className="sticky top-0 z-40 border-b border-white/40 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-black gradient-text">Payroll Officer</h1>
            <p className="text-sm text-slate-600">Manage monthly payroll approvals</p>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              router.push('/login');
            }}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-6 py-6">
        <div className="flex items-center justify-between">
          <div />
          <button
            onClick={() => router.push('/leave')}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Apply Leave
          </button>
        </div>

        <section className="premium-card relative overflow-hidden">
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-400/20 blur-3xl" />
          <div className="relative">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="mb-1 text-2xl font-black text-slate-900">Time & Attendance</h2>
                <div className="flex items-center gap-4 text-slate-600">
                  <span className="inline-flex items-center gap-2 text-sm"><Clock className="h-4 w-4" /> {currentTime.toLocaleTimeString()}</span>
                  <span className="inline-flex items-center gap-2 text-sm"><Calendar className="h-4 w-4" /> {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className={`rounded-2xl border-2 p-5 ${todayAttendance?.checkedIn ? 'border-green-200 bg-green-50/50' : 'border-blue-200 bg-blue-50/50'} `}>
                <div className="mb-3 flex items-center gap-3">
                  <div className={`rounded-xl p-3 ${todayAttendance?.checkedIn ? 'bg-green-500' : 'bg-blue-500'}`}>
                    <Power className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Check In</h3>
                    {todayAttendance?.checkInTime && (
                      <p className="text-xs text-slate-600">Checked in at {todayAttendance.checkInTime}</p>
                    )}
                  </div>
                </div>
                {todayAttendance?.checkInLocation && (
                  <div className="mb-3 inline-flex items-center gap-2 text-xs text-slate-600">
                    <MapPin className="h-4 w-4" /> {todayAttendance.checkInLocation}
                  </div>
                )}
                <button
                  onClick={handleCheckIn}
                  disabled={todayAttendance?.checkedIn || checkingIn}
                  className={`w-full rounded-xl px-4 py-3 text-sm font-semibold text-white ${todayAttendance?.checkedIn ? 'bg-slate-400' : 'bg-green-600 hover:bg-green-700'}`}
                >
                  {checkingIn ? 'Checking In...' : todayAttendance?.checkedIn ? 'Already Checked In' : 'Check In Now'}
                </button>
              </div>

              <div className={`rounded-2xl border-2 p-5 ${todayAttendance?.checkedOut ? 'border-orange-200 bg-orange-50/50' : 'border-slate-200 bg-slate-50/50'} `}>
                <div className="mb-3 flex items-center gap-3">
                  <div className={`rounded-xl p-3 ${todayAttendance?.checkedOut ? 'bg-orange-500' : 'bg-slate-400'}`}>
                    <PowerOff className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Check Out</h3>
                    {todayAttendance?.checkOutTime && (
                      <p className="text-xs text-slate-600">Checked out at {todayAttendance.checkOutTime}</p>
                    )}
                    {todayAttendance?.workingHours && (
                      <p className="text-xs font-semibold text-green-600">Worked: {todayAttendance.workingHours} hrs</p>
                    )}
                  </div>
                </div>
                {todayAttendance?.checkOutLocation && (
                  <div className="mb-3 inline-flex items-center gap-2 text-xs text-slate-600">
                    <MapPin className="h-4 w-4" /> {todayAttendance.checkOutLocation}
                  </div>
                )}
                <button
                  onClick={handleCheckOut}
                  disabled={!todayAttendance?.checkedIn || todayAttendance?.checkedOut || checkingOut}
                  className={`w-full rounded-xl px-4 py-3 text-sm font-semibold text-white ${(!todayAttendance?.checkedIn || todayAttendance?.checkedOut) ? 'bg-slate-400' : 'bg-orange-600 hover:bg-orange-700'}`}
                >
                  {checkingOut ? 'Checking Out...' : todayAttendance?.checkedOut ? 'Already Checked Out' : !todayAttendance?.checkedIn ? 'Check In First' : 'Check Out Now'}
                </button>
              </div>
            </div>
          </div>
        </section>
        {errorMessage && (
          <div className="flex items-start space-x-3 rounded-2xl border border-red-200 bg-red-50/80 p-4 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
            <p>{errorMessage}</p>
          </div>
        )}

        <section className="grid gap-4 md:grid-cols-4">
          <StatCard
            icon={<DollarSign className="h-6 w-6" />}
            label="Total Net Pay"
            value={formatCurrency(overview.totalNet)}
          />
          <StatCard
            icon={<Users className="h-6 w-6" />}
            label="Total Employees"
            value={overview.totalEmployees}
          />
          <StatCard
            icon={<Calculator className="h-6 w-6" />}
            label="Pending Payruns"
            value={overview.pending}
          />
          <StatCard
            icon={<CheckCircle className="h-6 w-6" />}
            label="Approved Payruns"
            value={overview.approved}
          />
        </section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="premium-card space-y-6"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Monthly Payruns</h2>
              <p className="text-sm text-slate-500">
                Select a payrun to review salary totals and trigger approvals.
              </p>
            </div>
            {approvingAction && (
              <div className="flex items-center space-x-2 text-sm text-blue-600">
                <Loader className="h-4 w-4 animate-spin" />
                <span>
                  {approvingAction === 'approve' && 'Approving payrun'}
                  {approvingAction === 'reject' && 'Rejecting payrun'}
                  {approvingAction === 'lock' && 'Locking payrun'}
                </span>
              </div>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-[260px,1fr]">
            <div className="space-y-3">
              {payruns.length === 0 ? (
                <div className="glass rounded-xl p-4 text-sm text-slate-500">
                  No payruns available. Generate payroll to get started.
                </div>
              ) : (
                payruns.map((run) => {
                  const isSelected = run.id === selectedPayrunId;
                  const label = `${MONTH_NAMES[(run.month - 1 + 12) % 12]} ${run.year}`;

                  return (
                    <button
                      key={run.id}
                      onClick={() => handleSelectPayrun(run.id)}
                      className={`w-full rounded-2xl border p-4 text-left transition-all ${
                        isSelected
                          ? 'border-blue-400 bg-blue-50/80 shadow-lg'
                          : 'border-white/20 bg-white/70 hover:border-blue-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-slate-900">{label}</h3>
                        <span
                          className={`badge ${
                            run.status === 'Approved'
                              ? 'badge-success'
                              : run.status === 'Pending Approval'
                              ? 'badge-warning'
                              : run.status === 'Rejected'
                              ? 'badge-danger'
                              : 'badge-info'
                          }`}
                        >
                          {run.status}
                        </span>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600">
                        <span>{run.total_employees ?? 0} employees</span>
                        <span>Total Net {formatCurrency(toNumber(run.total_net_salary))}</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            <div className="space-y-4 rounded-2xl border border-white/30 bg-white/80 p-6">
              {selectedPayrun ? (
                <>
                  <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div>
                      <p className="text-xs text-slate-500">Selected Payrun</p>
                      <h3 className="text-2xl font-black text-slate-900">
                        {MONTH_NAMES[(selectedPayrun.month - 1 + 12) % 12]} {selectedPayrun.year}
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-slate-500">Employees</p>
                        <p className="font-semibold text-slate-900">
                          {selectedPayrun.total_employees ?? 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Total Net</p>
                        <p className="font-semibold text-green-600">
                          {formatCurrency(toNumber(selectedPayrun.total_net_salary))}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Total Gross</p>
                        <p className="font-semibold text-slate-900">
                          {formatCurrency(toNumber(selectedPayrun.total_gross_salary))}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Deductions</p>
                        <p className="font-semibold text-slate-900">
                          {formatCurrency(toNumber(selectedPayrun.total_deductions))}
                        </p>
                      </div>
                    </div>
                  </div>

                  {approvalResult && (
                    <div className="rounded-xl border border-green-200 bg-green-50/80 p-4 text-sm text-green-700">
                      <p className="font-semibold">{approvalResult.message}</p>
                      {approvalResult.payslips && (
                        <ul className="mt-2 space-y-1 text-xs">
                          <li>
                            Payslips generated: <strong>{approvalResult.payslips.total}</strong>
                          </li>
                          <li>
                            Emails sent successfully:{' '}
                            <strong>{approvalResult.payslips.emailsSent}</strong>
                          </li>
                          {approvalResult.payslips.emailsFailed > 0 && (
                            <li className="text-red-600">
                              Emails failed: {approvalResult.payslips.emailsFailed}
                            </li>
                          )}
                        </ul>
                      )}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => handleApprovePayrun('approve')}
                      disabled={approvingAction !== null || selectedPayrun.status === 'Approved'}
                      className="flex-1 min-w-[140px] rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white shadow hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Approve & Send Payslips
                    </button>
                    <button
                      onClick={() => handleApprovePayrun('reject')}
                      disabled={approvingAction !== null}
                      className="flex-1 min-w-[120px] rounded-xl border border-red-200 bg-red-50 px-4 py-2 font-semibold text-red-600 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleApprovePayrun('lock')}
                      disabled={approvingAction !== null}
                      className="flex-1 min-w-[120px] rounded-xl border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Lock
                    </button>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-slate-700">
                      Employee payroll summary
                    </h4>
                    {loadingPayrollId === selectedPayrun.id && (
                      <div className="flex items-center space-x-2 text-xs text-slate-500">
                        <Loader className="h-3 w-3 animate-spin" />
                        <span>Loading payroll entries</span>
                      </div>
                    )}
                    {selectedPayrolls.length === 0 && loadingPayrollId !== selectedPayrun.id && (
                      <p className="text-xs text-slate-500">
                        No payroll entries available for this payrun yet.
                      </p>
                    )}
                    {selectedPayrolls.length > 0 && (
                      <div className="space-y-2">
                        {selectedPayrolls.slice(0, 10).map((row) => (
                          <div
                            key={row.id}
                            className="rounded-xl border border-white/40 bg-white/70 p-4 text-sm"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold text-slate-900">
                                  {row.first_name} {row.last_name}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {row.employee_code} - {row.department ?? 'Unknown'}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-slate-500">Net Salary</p>
                                <p className="font-semibold text-green-600">
                                  {formatCurrency(toNumber(row.net_salary))}
                                </p>
                              </div>
                            </div>
                            <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] text-slate-500">
                              <span>Basic: {formatCurrency(toNumber(row.basic_salary))}</span>
                              <span>Allowances: {formatCurrency(toNumber(row.allowances))}</span>
                              <span>Deductions: {formatCurrency(toNumber(row.deductions))}</span>
                            </div>
                          </div>
                        ))}
                        {selectedPayrolls.length > 10 && (
                          <p className="text-[11px] text-slate-500">
                            Showing first 10 of {selectedPayrolls.length} payroll records.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-sm text-slate-500">
                  Select a payrun to review totals and employee salaries.
                </p>
              )}
            </div>
          </div>
        </motion.section>
      </main>
    </div>
  );
}

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
}

function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="rounded-2xl border border-white/40 bg-white/80 p-5 shadow-sm"
    >
      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
        {icon}
      </div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-black text-slate-900">{value}</p>
    </motion.div>
  );
}
