'use client';

import { useEffect, useMemo, useState } from 'react';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  User, Calendar, Clock, DollarSign, FileText, Bell, LogOut,
  TrendingUp, CheckCircle, XCircle, AlertCircle, Download, Edit,
  MapPin, Power, PowerOff, ArrowRight, Loader
} from 'lucide-react';

export default function EmployeeDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [dailyReport, setDailyReport] = useState<any[]>([]);
  const [reportMonth, setReportMonth] = useState<string>(() => {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${d.getFullYear()}-${m}`;
  });
  const [monthlySummary, setMonthlySummary] = useState<any | null>(null);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [location, setLocation] = useState<string>('');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [nightRequests, setNightRequests] = useState<any[]>([]);
  const [newNight, setNewNight] = useState<{ startDate: string; endDate: string; reason: string }>({ startDate: '', endDate: '', reason: '' });
  const [submittingNight, setSubmittingNight] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);

      // Fetch profile
      const profileRes = await fetch('/api/profile', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile(profileData);
      }

      // Fetch today's attendance
      const todayRes = await fetch('/api/attendance/today', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (todayRes.ok) {
        const todayData = await todayRes.json();
        setTodayAttendance(todayData);
      }

      // Fetch recent attendance (for quick list)
      const attendanceRes = await fetch('/api/attendance', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (attendanceRes.ok) {
        const attendanceData = await attendanceRes.json();
        setAttendance(attendanceData.slice(0, 5));
      }

      // Fetch daily report (last 30 records)
      if (attendanceRes.ok) {
        const attendanceData = await attendanceRes.json();
        setDailyReport((Array.isArray(attendanceData) ? attendanceData : []).slice(0, 30));
      }

      // Fetch leave requests
      const leavesRes = await fetch('/api/leave', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (leavesRes.ok) {
        const leavesData = await leavesRes.json();
        setLeaves(leavesData.slice(0, 5));
      }

      // Fetch notifications
      const notifRes = await fetch('/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (notifRes.ok) {
        const notifData = await notifRes.json();
        setNotifications(notifData);
      }

      // Fetch my night shift requests
      const nsRes = await fetch('/api/night-shift', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (nsRes.ok) {
        const data = await nsRes.json();
        setNightRequests(Array.isArray(data) ? data.slice(0, 5) : []);
      }

      // Get user's location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            // Reverse geocode (simplified - in production use a geocoding service)
            setLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
          },
          () => {
            setLocation('Location not available');
          }
        );
      }
      // Load monthly summary
      try {
        const sumRes = await fetch(`/api/attendance/summary?month=${reportMonth}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (sumRes.ok) {
          const rows = await sumRes.json();
          setMonthlySummary(Array.isArray(rows) && rows.length > 0 ? rows[0] : null);
        }
      } catch {}
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLunch = async (action: 'start' | 'end') => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch('/api/attendance/lunch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ action }),
      });
      const out = await res.json();
      if (!res.ok) {
        alert(out?.error || 'Failed to update lunch');
        return;
      }
      await fetchData();
    } catch (_) {
      alert('Failed to update lunch');
    }
  };

  const markNotificationsAsRead = async () => {
    const unread = notifications.some((notification) => !notification.is_read);
    if (!unread) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }

    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ markAllRead: true }),
      });

      setNotifications((prev) => prev.map((notification) => ({
        ...notification,
        is_read: true,
      })));
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  };

  const handleNotificationToggle = async () => {
    const next = !showNotifications;
    setShowNotifications(next);
    if (next) {
      await markNotificationsAsRead();
    }
  };

  const handleCheckIn = async () => {
    setCheckingIn(true);
    const token = localStorage.getItem('token');

    try {
      let latitude: number | null = null;
      let longitude: number | null = null;
      let locationName = 'Office';

      if (navigator.geolocation) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
        locationName = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      }

      const response = await fetch('/api/attendance/checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          latitude,
          longitude,
          location: locationName,
        }),
      });

      if (response.ok) {
        await fetchData();
      } else {
        const error = await response.json();
        alert(error.error || 'Check-in failed');
      }
    } catch (error) {
      console.error('Check-in error:', error);
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
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
        locationName = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      }

      const response = await fetch('/api/attendance/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          latitude,
          longitude,
          location: locationName,
        }),
      });

      if (response.ok) {
        await fetchData();
      } else {
        const error = await response.json();
        alert(error.error || 'Check-out failed');
      }
    } catch (error) {
      console.error('Check-out error:', error);
      alert('Failed to check out. Please try again.');
    } finally {
      setCheckingOut(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.is_read).length,
    [notifications]
  );

  const submitNightShiftRequest = async () => {
    if (!newNight.startDate || !newNight.endDate) {
      alert('Please select start and end dates');
      return;
    }
    setSubmittingNight(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/night-shift', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ startDate: newNight.startDate, endDate: newNight.endDate, reason: newNight.reason }),
      });
      const out = await res.json();
      if (!res.ok) {
        alert(out?.error || 'Failed to submit');
      } else {
        // refresh list
        await fetchData();
        setNewNight({ startDate: '', endDate: '', reason: '' });
      }
    } catch (e) {
      alert('Unable to submit request');
    } finally {
      setSubmittingNight(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  const stats = {
    totalLeaves: 25,
    usedLeaves: leaves.filter(l => l.status === 'Approved').reduce((sum, l) => sum + (l.total_days || 0), 0),
    availableLeaves: 25 - leaves.filter(l => l.status === 'Approved').reduce((sum, l) => sum + (l.total_days || 0), 0),
    presentDays: attendance.filter(a => a.status === 'Present' || a.status === 'Late').length,
    totalDays: attendance.length || 22,
    pendingLeaves: leaves.filter(l => l.status === 'Pending').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
      {/* Top Bar */}
      <header className="glass sticky top-0 z-40 border-b border-white/20 backdrop-blur-xl">
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black gradient-text">Employee Dashboard</h1>
            <p className="text-sm text-slate-600">Welcome back, {profile?.first_name || user?.firstName}!</p>
          </div>
          

        
          <div className="flex items-center space-x-4">
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleNotificationToggle}
                className="relative p-2 glass rounded-xl hover:bg-white/50 transition-colors"
              >
                <Bell className="h-5 w-5 text-slate-600" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </motion.button>
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-[28rem] glass rounded-2xl shadow-xl border border-white/40 max-h-[28rem] overflow-y-auto z-50">
                  <div className="p-4 flex items-center justify-between border-b border-white/30">
                    <h4 className="text-sm font-semibold text-slate-800">Notifications</h4>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-xs text-slate-500 hover:text-slate-700"
                    >
                      Close
                    </button>
                  </div>
                  <div className="p-3 space-y-3">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center">No notifications yet.</p>
                    ) : (
                      notifications.map((notification) => (
                        <div key={notification.id} className="p-3 rounded-xl bg-white/60">
                          <p className="text-xs font-semibold text-slate-700">{notification.title}</p>
                          <p className="text-xs text-slate-500 mt-1">{notification.message}</p>
                          <p className="text-[10px] text-slate-400 mt-2">
                            {notification.created_at ? new Date(notification.created_at).toLocaleString() : ''}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
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
        

        {/* Night Shift Request */}
        <section className="premium-card mb-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Night Shift Request</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/30 bg-white/80 p-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <label className="text-xs text-slate-600">Start Date</label>
                  <input type="date" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" value={newNight.startDate} onChange={(e) => setNewNight((p) => ({ ...p, startDate: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-slate-600">End Date</label>
                  <input type="date" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" value={newNight.endDate} onChange={(e) => setNewNight((p) => ({ ...p, endDate: e.target.value }))} />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-slate-600">Reason (optional)</label>
                  <input type="text" placeholder="Reason" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" value={newNight.reason} onChange={(e) => setNewNight((p) => ({ ...p, reason: e.target.value }))} />
                </div>
              </div>
              <button onClick={submitNightShiftRequest} disabled={submittingNight} className="mt-4 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
                {submittingNight ? 'Submitting...' : 'Submit Night Shift Request'}
              </button>
            </div>
            <div className="rounded-2xl border border-white/30 bg-white/80 p-4">
              <p className="mb-3 text-sm font-semibold text-slate-800">Recent Requests</p>
              <div className="space-y-2">
                {nightRequests.length === 0 ? (
                  <p className="text-xs text-slate-500">No requests yet.</p>
                ) : (
                  nightRequests.map((r) => (
                    <div key={r.id} className="rounded-xl bg-white/70 p-3 text-sm">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-slate-900">{r.start_date} → {r.end_date}</p>
                        <span className={`badge ${r.status === 'Approved' ? 'badge-success' : r.status === 'Rejected' ? 'badge-danger' : 'badge-warning'}`}>{r.status}</span>
                      </div>
                      {r.reason && <p className="mt-1 text-xs text-slate-500">{r.reason}</p>}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="premium-card mb-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-4 rounded-2xl">
                <User className="h-12 w-12 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {profile?.first_name} {profile?.last_name}
                </h2>
                <p className="text-slate-600">{profile?.designation} • {profile?.department}</p>
                <p className="text-sm text-slate-500">
                  {profile?.employee_code} • Joined {profile?.join_date ? new Date(profile.join_date).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/dashboard/employee/profile')}
              className="glass px-4 py-2 rounded-xl flex items-center space-x-2 hover:bg-white/80"
            >
              <Edit className="h-4 w-4" />
              <span>Edit Profile</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard
            icon={<Calendar className="h-6 w-6" />}
            label="Total Leave"
            value={stats.totalLeaves}
            color="from-blue-500 to-blue-600"
          />
          <StatCard
            icon={<CheckCircle className="h-6 w-6" />}
            label="Available"
            value={stats.availableLeaves}
            color="from-green-500 to-green-600"
          />
          <StatCard
            icon={<XCircle className="h-6 w-6" />}
            label="Used"
            value={stats.usedLeaves}
            color="from-orange-500 to-orange-600"
          />
          <StatCard
            icon={<Clock className="h-6 w-6" />}
            label="Present Days"
            value={stats.presentDays}
            color="from-purple-500 to-purple-600"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <QuickAction
            icon={<Clock className="h-5 w-5" />}
            label="View Attendance"
            onClick={() => router.push('/attendance')}
            color="from-blue-500 to-blue-600"
          />
          <QuickAction
            icon={<Calendar className="h-5 w-5" />}
            label="Apply Leave"
            onClick={() => router.push('/leave')}
            color="from-purple-500 to-purple-600"
          />
          <QuickAction
            icon={<FileText className="h-5 w-5" />}
            label="Documents"
            onClick={() => {}}
            color="from-orange-500 to-orange-600"
          />
        </div>

        {/* Performance */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Daily Report */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="premium-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <span>Daily Report (Last 30 days)</span>
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Shift</th>
                    <th>Check In</th>
                    <th>Lunch (min)</th>
                    <th>Check Out</th>
                    <th>Hours</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyReport.length === 0 ? (
                    <tr><td colSpan={7} className="text-center text-sm text-slate-500">No records</td></tr>
                  ) : (
                    dailyReport.map((r) => (
                      <tr key={r.id}>
                        <td>{new Date(r.date).toLocaleDateString()}</td>
                        <td>{r.shift_type || 'day'}</td>
                        <td>{r.check_in || '-'}</td>
                        <td>{r.lunch_minutes ?? 0}</td>
                        <td>{r.check_out || '-'}</td>
                        <td>{r.working_hours ?? 0}</td>
                        <td>{r.status}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Monthly Summary */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="premium-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                <span>Monthly Report</span>
              </h3>
              <input
                type="month"
                value={reportMonth}
                onChange={async (e) => {
                  const v = e.target.value;
                  setReportMonth(v);
                  const token = localStorage.getItem('token');
                  if (token) {
                    const sumRes = await fetch(`/api/attendance/summary?month=${v}`, { headers: { 'Authorization': `Bearer ${token}` } });
                    if (sumRes.ok) {
                      const rows = await sumRes.json();
                      setMonthlySummary(Array.isArray(rows) && rows.length > 0 ? rows[0] : null);
                    }
                  }
                }}
                className="glass px-3 py-2 rounded-xl text-sm"
              />
            </div>
            {monthlySummary ? (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="glass p-3 rounded-xl">
                    <p className="text-xs text-slate-500">Days Worked</p>
                    <p className="text-xl font-black text-slate-900">{monthlySummary.days_worked || 0}</p>
                  </div>
                  <div className="glass p-3 rounded-xl">
                    <p className="text-xs text-slate-500">Total Hours</p>
                    <p className="text-xl font-black text-slate-900">{Number(monthlySummary.total_hours || 0).toFixed(1)}</p>
                  </div>
                  <div className="glass p-3 rounded-xl">
                    <p className="text-xs text-slate-500">Night Days</p>
                    <p className="text-xl font-black text-slate-900">{monthlySummary.night_days || 0}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-600 mb-2">Hours vs Target (8h/day)</p>
                  <div className="w-full bg-slate-200 rounded-full h-3">
                    {(() => {
                      const target = (monthlySummary.days_worked || 0) * 8;
                      const hours = Number(monthlySummary.total_hours || 0);
                      const pct = target > 0 ? Math.min(100, Math.round((hours / target) * 100)) : 0;
                      return <div className="h-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600" style={{ width: `${pct}%` }} />;
                    })()}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No summary for selected month.</p>
            )}
          </motion.div>
        </div>

        {/* Time & Attendance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="premium-card mb-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-black text-slate-900 mb-2">Time & Attendance</h2>
                <div className="flex items-center space-x-4 text-slate-600">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <span className="text-2xl font-bold">{currentTime.toLocaleTimeString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>{currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                  </div>
                </div>
                {todayAttendance?.shiftType && (
                  <div className="mt-2 text-xs text-slate-600 flex items-center gap-2">
                    <span className={`badge ${todayAttendance.shiftType === 'night' ? 'badge-warning' : 'badge-info'}`}>Shift: {todayAttendance.shiftType}</span>
                    {todayAttendance?.scheduledCheckOut && (
                      <span>Scheduled out at {new Date(todayAttendance.scheduledCheckOut).toLocaleTimeString()}</span>
                    )}
                    {todayAttendance?.autoCheckout && todayAttendance?.autoCheckoutAt && (
                      <span className="text-red-600">• Auto checked out at {new Date(todayAttendance.autoCheckoutAt).toLocaleTimeString()}</span>
                    )}
                  </div>
                )}
                {todayAttendance && (
                  <div className="mt-2 text-xs text-slate-600 flex items-center gap-2">
                    <span>Lunch: {todayAttendance.lunchMinutes || 0} min</span>
                    {!todayAttendance.checkedOut && todayAttendance.checkedIn && (
                      todayAttendance.lunchStart && !todayAttendance.lunchEnd ? (
                        <button onClick={() => handleLunch('end')} className="px-2 py-1 rounded-md bg-orange-600 text-white text-[11px]">End Lunch</button>
                      ) : (
                        <button onClick={() => handleLunch('start')} className="px-2 py-1 rounded-md bg-slate-800 text-white text-[11px]">Start Lunch</button>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Check-In */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className={`glass p-6 rounded-2xl border-2 ${
                  todayAttendance?.checkedIn
                    ? 'border-green-200 bg-green-50/50'
                    : 'border-blue-200 bg-blue-50/50'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-xl ${
                      todayAttendance?.checkedIn
                        ? 'bg-green-500'
                        : 'bg-blue-500'
                    }`}>
                      <Power className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">Check In</h3>
                      {todayAttendance?.checkInTime && (
                        <p className="text-sm text-slate-600">Checked in at {todayAttendance.checkInTime}</p>
                      )}
                    </div>
                  </div>
                </div>
                {todayAttendance?.checkInLocation && (
                  <div className="flex items-center space-x-2 text-sm text-slate-600 mb-4">
                    <MapPin className="h-4 w-4" />
                    <span>{todayAttendance.checkInLocation}</span>
                  </div>
                )}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCheckIn}
                  disabled={todayAttendance?.checkedIn || checkingIn || todayAttendance?.hasPendingNightToday}
                  className={`w-full py-4 rounded-xl font-bold text-white transition-all ${
                    todayAttendance?.checkedIn || todayAttendance?.hasPendingNightToday
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg'
                  }`}
                >
                  {checkingIn ? (
                    <span className="flex items-center justify-center space-x-2">
                      <Loader className="h-5 w-5 animate-spin" />
                      <span>Checking In...</span>
                    </span>
                  ) : todayAttendance?.hasPendingNightToday ? (
                    'Night Shift Pending Approval'
                  ) : todayAttendance?.checkedIn ? (
                    'Already Checked In'
                  ) : (
                    'Check In Now'
                  )}
                </motion.button>
              </motion.div>

              {/* Check-Out */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className={`glass p-6 rounded-2xl border-2 ${
                  todayAttendance?.checkedOut
                    ? 'border-orange-200 bg-orange-50/50'
                    : 'border-slate-200 bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-xl ${
                      todayAttendance?.checkedOut
                        ? 'bg-orange-500'
                        : 'bg-slate-400'
                    }`}>
                      <PowerOff className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">Check Out</h3>
                      {todayAttendance?.checkOutTime && (
                        <p className="text-sm text-slate-600">Checked out at {todayAttendance.checkOutTime}</p>
                      )}
                      {todayAttendance?.workingHours && (
                        <p className="text-sm font-semibold text-green-600">Worked: {todayAttendance.workingHours} hrs</p>
                      )}
                    </div>
                  </div>
                </div>
                {todayAttendance?.checkOutLocation && (
                  <div className="flex items-center space-x-2 text-sm text-slate-600 mb-4">
                    <MapPin className="h-4 w-4" />
                    <span>{todayAttendance.checkOutLocation}</span>
                  </div>
                )}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCheckOut}
                  disabled={!todayAttendance?.checkedIn || todayAttendance?.checkedOut || checkingOut}
                  className={`w-full py-4 rounded-xl font-bold text-white transition-all ${
                    !todayAttendance?.checkedIn || todayAttendance?.checkedOut
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 shadow-lg'
                  }`}
                >
                  {checkingOut ? (
                    <span className="flex items-center justify-center space-x-2">
                      <Loader className="h-5 w-5 animate-spin" />
                      <span>Checking Out...</span>
                    </span>
                  ) : todayAttendance?.checkedOut ? (
                    'Already Checked Out'
                  ) : !todayAttendance?.checkedIn ? (
                    'Check In First'
                  ) : (
                    'Check Out Now'
                  )}
                </motion.button>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Attendance */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="premium-card"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <span>Recent Attendance</span>
              </h3>
              <button
                onClick={() => router.push('/attendance')}
                className="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center space-x-1"
              >
                <span>View All</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              {attendance.length > 0 ? (
                attendance.map((record, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 glass rounded-xl hover:bg-white/80 transition-all">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {new Date(record.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </p>
                      <p className="text-sm text-slate-600">
                        {record.check_in || '-'} - {record.check_out || '-'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">{record.working_hours || 0} hrs</p>
                      <span className={`badge ${
                        record.status === 'Present' ? 'badge-success' :
                        record.status === 'Late' ? 'badge-warning' :
                        'badge-danger'
                      }`}>
                        {record.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-500 py-4">No attendance records yet</p>
              )}
            </div>
          </motion.div>

          {/* Leave Requests */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="premium-card"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                <span>Leave Requests</span>
              </h3>
              <button
                onClick={() => router.push('/leave')}
                className="text-sm text-purple-600 hover:text-purple-700 font-semibold flex items-center space-x-1"
              >
                <span>View All</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              {leaves.length > 0 ? (
                leaves.map((leave) => (
                  <div key={leave.id} className="p-4 glass rounded-xl hover:bg-white/80 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-slate-900">{leave.leave_type_name}</p>
                      <span className={`badge ${
                        leave.status === 'Approved' ? 'badge-success' :
                        leave.status === 'Pending' ? 'badge-warning' :
                        'badge-danger'
                      }`}>
                        {leave.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-1">
                      {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()} ({leave.total_days} days)
                    </p>
                    <p className="text-xs text-slate-500">{leave.reason}</p>
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-500 py-4">No leave requests yet</p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: any) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="premium-card relative overflow-hidden"
    >
      <div className={`bg-gradient-to-br ${color} w-12 h-12 rounded-xl flex items-center justify-center text-white mb-3 shadow-lg`}>
        {icon}
      </div>
      <p className="text-sm text-slate-600 font-semibold mb-1">{label}</p>
      <p className="text-3xl font-black text-slate-900">{value}</p>
      <motion.div
        className={`absolute -bottom-2 -right-2 w-24 h-24 bg-gradient-to-br ${color} opacity-10 rounded-full blur-2xl`}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
    </motion.div>
  );
}

function QuickAction({ icon, label, onClick, color }: any) {
  return (
    <motion.button
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="premium-card flex items-center space-x-3 p-4 hover:shadow-xl transition-all group"
    >
      <div className={`bg-gradient-to-br ${color} p-3 rounded-xl text-white group-hover:scale-110 transition-transform shadow-lg`}>
        {icon}
      </div>
      <span className="font-semibold text-slate-900">{label}</span>
    </motion.button>
  );
}