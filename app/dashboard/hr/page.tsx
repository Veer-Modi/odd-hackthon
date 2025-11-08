'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Users, UserPlus, Calendar, Clock, FileText, Bell, LogOut,
  CheckCircle, XCircle, AlertCircle, TrendingUp, Building2, Search, Loader2, MapPin, Power, PowerOff
} from 'lucide-react';

export default function HRDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEmployees: 145,
    activeEmployees: 142,
    newHires: 0,
    resignations: 3,
    pendingLeaves: 0,
    approvedToday: 5,
    attendanceRate: 94,
    avgWorkingHours: 8.5,
  });
  const [pendingLeaves, setPendingLeaves] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [recentEmployees, setRecentEmployees] = useState<any[]>([]);
  const [passwordRequests, setPasswordRequests] = useState<any[]>([]);
  const [processingLeaveId, setProcessingLeaveId] = useState<number | null>(null);
  const [processingAction, setProcessingAction] = useState<'approve' | 'reject' | null>(null);
  const [todayAttendance, setTodayAttendance] = useState<any>(null);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [location, setLocation] = useState<string>('');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchNotifications = async (token: string) => {
    try {
      const response = await fetch('/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
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
        body: JSON.stringify({ latitude, longitude, location: locationName }),
      });

      if (response.ok) {
        const todayRes = await fetch('/api/attendance/today', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (todayRes.ok) setTodayAttendance(await todayRes.json());
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
        body: JSON.stringify({ latitude, longitude, location: locationName }),
      });

      if (response.ok) {
        const todayRes = await fetch('/api/attendance/today', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (todayRes.ok) setTodayAttendance(await todayRes.json());
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

  const fetchPendingLeaves = async (token: string) => {
    try {
      const response = await fetch('/api/leave?status=Pending', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        const formatted = (Array.isArray(data) ? data : [])
          .filter((leave: any) => !leave.requires_admin_approval)
          .map((leave: any) => ({
            id: leave.id,
            employeeName: `${leave.first_name ?? ''} ${leave.last_name ?? ''}`.trim(),
            employeeCode: leave.employee_code,
            leaveType: leave.leave_type_name,
            startDate: leave.start_date,
            endDate: leave.end_date,
            totalDays: leave.total_days,
            reason: leave.reason,
          }));
        setPendingLeaves(formatted);
        setStats((prev) => ({
          ...prev,
          pendingLeaves: formatted.length,
        }));
      }
    } catch (error) {
      console.error('Failed to fetch pending leaves:', error);
    }
  };

  const fetchRecentEmployees = async (token: string) => {
    try {
      const response = await fetch('/api/employees', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        const formatted = (Array.isArray(data) ? data : [])
          .slice(0, 5)
          .map((emp: any) => ({
            id: emp.id,
            name: `${emp.first_name ?? ''} ${emp.last_name ?? ''}`.trim(),
            code: emp.employee_code,
            department: emp.department,
            joinDate: emp.join_date,
            status: emp.status,
          }));
        setRecentEmployees(formatted);
        setStats((prev) => ({
          ...prev,
          newHires: formatted.length,
        }));
      }
    } catch (error) {
      console.error('Failed to fetch recent employees:', error);
    }
  };

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (!token || !userData) {
        router.push('/login');
        return;
      }

      setUser(JSON.parse(userData));

      try {
        await Promise.all([
          fetchPendingLeaves(token),
          fetchNotifications(token),
          fetchRecentEmployees(token),
        ]);

        const todayRes = await fetch('/api/attendance/today', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (todayRes.ok) {
          const todayData = await todayRes.json();
          setTodayAttendance(todayData);
        }

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              setLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
            },
            () => setLocation('Location not available')
          );
        }
      } catch (error) {
        console.error('HR dashboard initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [router]);

  const markNotificationsAsRead = async () => {
    const unread = notifications.some((notification: any) => !notification.is_read);
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

      setNotifications((prev) => prev.map((notification: any) => ({
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

  const handleLeaveAction = async (leaveId: number, action: 'Approved' | 'Rejected') => {
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }

    let rejectionReason: string | undefined;
    if (action === 'Rejected') {
      const input = window.prompt('Please provide a reason for rejection (optional):');
      if (input === null) {
        return;
      }
      rejectionReason = input.trim() || undefined;
    }

    setProcessingLeaveId(leaveId);
    setProcessingAction(action === 'Approved' ? 'approve' : 'reject');

    try {
      const response = await fetch('/api/leave', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ id: leaveId, status: action, rejectionReason }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || 'Failed to update leave request');
        return;
      }

      await fetchPendingLeaves(token);
    } catch (error) {
      console.error('Failed to update leave request:', error);
      alert('Failed to update leave request. Please try again.');
    } finally {
      setProcessingLeaveId(null);
      setProcessingAction(null);
    }
  };

  const unreadCount = useMemo(
    () => notifications.filter((notification: any) => !notification.is_read).length,
    [notifications]
  );

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
            <h1 className="text-2xl font-black gradient-text">HR Dashboard</h1>
            <p className="text-sm text-slate-600">Human Resources Management</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 glass px-4 py-2 rounded-xl">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search employees..."
                className="bg-transparent border-none outline-none text-sm w-48"
              />
            </div>
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
                <div className="absolute right-0 mt-3 w-80 glass rounded-2xl shadow-xl border border-white/40 max-h-96 overflow-y-auto z-50">
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
                      notifications.map((notification: any) => (
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
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className={`glass p-6 rounded-2xl border-2 ${
                  todayAttendance?.checkedIn ? 'border-green-200 bg-green-50/50' : 'border-blue-200 bg-blue-50/50'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-xl ${
                      todayAttendance?.checkedIn ? 'bg-green-500' : 'bg-blue-500'
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
                  disabled={todayAttendance?.checkedIn || checkingIn}
                  className={`w-full py-4 rounded-xl font-bold text-white transition-all ${
                    todayAttendance?.checkedIn ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg'
                  }`}
                >
                  {checkingIn ? (
                    <span className="flex items-center justify-center space-x-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Checking In...</span>
                    </span>
                  ) : todayAttendance?.checkedIn ? (
                    'Already Checked In'
                  ) : (
                    'Check In Now'
                  )}
                </motion.button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className={`glass p-6 rounded-2xl border-2 ${
                  todayAttendance?.checkedOut ? 'border-orange-200 bg-orange-50/50' : 'border-slate-200 bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-xl ${
                      todayAttendance?.checkedOut ? 'bg-orange-500' : 'bg-slate-400'
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
                    !todayAttendance?.checkedIn || todayAttendance?.checkedOut ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 shadow-lg'
                  }`}
                >
                  {checkingOut ? (
                    <span className="flex items-center justify-center space-x-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
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
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard
            icon={<Users className="h-6 w-6" />}
            label="Total Employees"
            value={stats.totalEmployees}
            change="+5.2%"
            color="from-blue-500 to-blue-600"
          />
          <StatCard
            icon={<CheckCircle className="h-6 w-6" />}
            label="Active"
            value={stats.activeEmployees}
            change="+2.1%"
            color="from-green-500 to-green-600"
          />
          <StatCard
            icon={<UserPlus className="h-6 w-6" />}
            label="New Hires (Month)"
            value={stats.newHires}
            change="+12%"
            color="from-purple-500 to-purple-600"
          />
          <StatCard
            icon={<AlertCircle className="h-6 w-6" />}
            label="Pending Leaves"
            value={stats.pendingLeaves}
            change=""
            color="from-orange-500 to-orange-600"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-5 gap-4 mb-6">
          <QuickAction
            icon={<Calendar className="h-5 w-5" />}
            label="Apply Leave"
            onClick={() => router.push('/leave')}
            color="from-purple-600 to-pink-600"
          />
          <QuickAction
            icon={<UserPlus className="h-5 w-5" />}
            label="Add Employee"
            onClick={() => router.push('/employees')}
            color="from-blue-500 to-blue-600"
          />
          <QuickAction
            icon={<FileText className="h-5 w-5" />}
            label="Leave Approvals"
            onClick={() => router.push('/leave')}
            color="from-purple-500 to-purple-600"
          />
          <QuickAction
            icon={<Building2 className="h-5 w-5" />}
            label="Departments"
            onClick={() => {}}
            color="from-green-500 to-green-600"
          />
          <QuickAction
            icon={<Clock className="h-5 w-5" />}
            label="Attendance"
            onClick={() => router.push('/attendance')}
            color="from-orange-500 to-orange-600"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Pending Leave Approvals */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="premium-card"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
                <FileText className="h-5 w-5 text-purple-600" />
                <span>Pending Leave Approvals</span>
              </h3>
              <span className="badge badge-warning">{pendingLeaves.length}</span>
            </div>
            <div className="space-y-3">
              {pendingLeaves.map((leave) => (
                <div key={leave.id} className="p-4 glass rounded-xl hover:bg-white/80 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-slate-900">{leave.employeeName}</p>
                    <span className="badge badge-info">{leave.leaveType}</span>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">
                    {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()} ({leave.totalDays} days)
                  </p>
                  <p className="text-xs text-slate-500 mb-3">{leave.reason}</p>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleLeaveAction(leave.id, 'Approved')}
                      disabled={processingLeaveId === leave.id}
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-3 py-2 rounded-lg text-sm font-semibold flex items-center justify-center space-x-1"
                    >
                      {processingLeaveId === leave.id && processingAction === 'approve' ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                      <span>Approve</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleLeaveAction(leave.id, 'Rejected')}
                      disabled={processingLeaveId === leave.id}
                      className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white px-3 py-2 rounded-lg text-sm font-semibold flex items-center justify-center space-x-1"
                    >
                      {processingLeaveId === leave.id && processingAction === 'reject' ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                      <span>Reject</span>
                    </motion.button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Password Change Requests */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="premium-card"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <span>Password Change Requests</span>
              </h3>
              <span className="badge badge-warning">{passwordRequests.length}</span>
            </div>
            <div className="space-y-3">
              {passwordRequests.map((req) => (
                <div key={req.id} className="p-4 glass rounded-xl hover:bg-white/80 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-slate-900">{req.employeeName}</p>
                    <span className="text-sm text-slate-500">{req.employeeCode}</span>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">Reason: {req.reason}</p>
                  <p className="text-xs text-slate-500 mb-3">Requested on {new Date(req.date).toLocaleDateString()}</p>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-2 rounded-lg text-sm font-semibold"
                    >
                      Set New Password
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 glass px-3 py-2 rounded-lg text-sm font-semibold hover:bg-white"
                    >
                      Reject
                    </motion.button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Recent Hires & Department Overview */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Hires */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="premium-card"
          >
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center space-x-2">
              <UserPlus className="h-5 w-5 text-green-600" />
              <span>Recent Hires</span>
            </h3>
            <div className="space-y-3">
              {recentEmployees.map((emp) => (
                <div key={emp.id} className="flex items-center justify-between p-3 glass rounded-xl hover:bg-white/80 transition-all">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-2 rounded-lg">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{emp.name}</p>
                      <p className="text-sm text-slate-600">{emp.department} • {emp.code}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Joined</p>
                    <p className="text-sm font-semibold text-slate-900">{new Date(emp.joinDate).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Department Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="premium-card"
          >
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              <span>Department Overview</span>
            </h3>
            <div className="space-y-3">
              {[
                { name: 'IT', count: 45, percentage: 31 },
                { name: 'Finance', count: 28, percentage: 19 },
                { name: 'HR', count: 15, percentage: 10 },
                { name: 'Sales', count: 35, percentage: 24 },
                { name: 'Operations', count: 22, percentage: 16 },
              ].map((dept, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-3 glass rounded-xl"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-slate-900">{dept.name}</span>
                    <span className="text-sm text-slate-600">{dept.count} employees</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${dept.percentage}%` }}
                      transition={{ duration: 1, delay: idx * 0.1 }}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Employee Growth Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="premium-card mt-6"
        >
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <span>Employee Growth - Last 6 Months</span>
          </h3>
          <div className="flex items-end justify-between space-x-3 h-64">
            {[
              { month: 'Jul', count: 132, joined: 8, left: 3 },
              { month: 'Aug', count: 137, joined: 6, left: 1 },
              { month: 'Sep', count: 140, joined: 5, left: 2 },
              { month: 'Oct', count: 142, joined: 4, left: 2 },
              { month: 'Nov', count: 144, joined: 3, left: 1 },
              { month: 'Dec', count: 145, joined: 2, left: 1 },
            ].map((data, idx) => {
              const maxCount = 150;
              const heightPercentage = (data.count / maxCount) * 100;
              return (
                <div key={data.month} className="flex-1 flex flex-col items-center space-y-2">
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: `${heightPercentage}%`, opacity: 1 }}
                    transition={{ duration: 1, delay: idx * 0.1 }}
                    className="w-full bg-gradient-to-t from-blue-700 via-blue-500 to-blue-400 rounded-t-xl relative group cursor-pointer hover:from-blue-800 hover:via-blue-600 hover:to-blue-500 transition-all shadow-lg"
                  >
                    <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap font-semibold shadow-xl z-10">
                      <p className="font-bold mb-1">{data.count} Total</p>
                      <p className="text-green-400">+ {data.joined} Joined</p>
                      <p className="text-red-400">- {data.left} Left</p>
                    </div>
                  </motion.div>
                  <span className="text-sm font-bold text-slate-600">{data.month}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="glass p-4 rounded-xl text-center">
              <p className="text-xs text-slate-600 mb-1">Total Growth</p>
              <p className="text-2xl font-black text-green-600">+13</p>
            </div>
            <div className="glass p-4 rounded-xl text-center">
              <p className="text-xs text-slate-600 mb-1">Joined</p>
              <p className="text-2xl font-black text-blue-600">28</p>
            </div>
            <div className="glass p-4 rounded-xl text-center">
              <p className="text-xs text-slate-600 mb-1">Left</p>
              <p className="text-2xl font-black text-red-600">10</p>
            </div>
          </div>
        </motion.div>

        {/* Attendance & Leave Analytics */}
        <div className="grid lg:grid-cols-2 gap-6 mt-6">
          {/* Attendance Rate Trends */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="premium-card"
          >
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Attendance Rate Trends</span>
            </h3>
            <div className="space-y-4">
              {[
                { dept: 'IT', rate: 96, color: 'from-blue-500 to-blue-600' },
                { dept: 'Finance', rate: 94, color: 'from-green-500 to-green-600' },
                { dept: 'Sales', rate: 92, color: 'from-purple-500 to-purple-600' },
                { dept: 'Operations', rate: 91, color: 'from-orange-500 to-orange-600' },
                { dept: 'HR', rate: 97, color: 'from-pink-500 to-pink-600' },
              ].map((dept, idx) => (
                <motion.div
                  key={dept.dept}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-700 w-24">{dept.dept}</span>
                    <div className="flex-1 mx-4">
                      <div className="relative h-8 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${dept.rate}%` }}
                          transition={{ duration: 1, delay: idx * 0.1 }}
                          className={`h-full bg-gradient-to-r ${dept.color} flex items-center justify-end pr-3`}
                        >
                          <span className="text-xs font-bold text-white drop-shadow-lg">{dept.rate}%</span>
                        </motion.div>
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      dept.rate >= 95 ? 'bg-green-100 text-green-700' :
                      dept.rate >= 90 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {dept.rate >= 95 ? 'Excellent' : dept.rate >= 90 ? 'Good' : 'Low'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Leave Type Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="premium-card"
          >
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              <span>Leave Distribution</span>
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { type: 'Sick Leave', count: 23, color: 'from-red-500 to-red-600', percentage: 38 },
                { type: 'Casual', count: 21, color: 'from-blue-500 to-blue-600', percentage: 35 },
                { type: 'Annual', count: 12, color: 'from-purple-500 to-purple-600', percentage: 20 },
                { type: 'Other', count: 4, color: 'from-orange-500 to-orange-600', percentage: 7 },
              ].map((leave, idx) => (
                <motion.div
                  key={leave.type}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="text-center p-4 glass rounded-xl"
                >
                  <div className="relative w-24 h-24 mx-auto mb-3">
                    <svg className="w-24 h-24 transform -rotate-90">
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="#e2e8f0"
                        strokeWidth="12"
                        fill="none"
                      />
                      <motion.circle
                        initial={{ strokeDashoffset: 251 }}
                        animate={{ strokeDashoffset: 251 - (251 * leave.percentage) / 100 }}
                        transition={{ duration: 1.5, delay: idx * 0.1 }}
                        cx="48"
                        cy="48"
                        r="40"
                        stroke={`url(#gradient-${idx})`}
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray="251"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-xl font-black text-slate-900">{leave.count}</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-slate-700 mb-1">{leave.type}</p>
                  <p className="text-xs text-slate-500">{leave.percentage}%</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, change, color }: any) {
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
      {change && <p className="text-sm text-green-600 font-semibold">{change}</p>}
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
