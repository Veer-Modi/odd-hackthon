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
  const [leaves, setLeaves] = useState<any[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [location, setLocation] = useState<string>('');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

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

      // Fetch recent attendance
      const attendanceRes = await fetch('/api/attendance', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (attendanceRes.ok) {
        const attendanceData = await attendanceRes.json();
        setAttendance(attendanceData.slice(0, 5));
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
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
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
                <div className="absolute right-0 mt-3 w-72 glass rounded-2xl shadow-xl border border-white/40 max-h-80 overflow-y-auto z-50">
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
        {/* Check-In/Check-Out Section - Prominent */}
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
                  disabled={todayAttendance?.checkedIn || checkingIn}
                  className={`w-full py-4 rounded-xl font-bold text-white transition-all ${
                    todayAttendance?.checkedIn
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg'
                  }`}
                >
                  {checkingIn ? (
                    <span className="flex items-center justify-center space-x-2">
                      <Loader className="h-5 w-5 animate-spin" />
                      <span>Checking In...</span>
                    </span>
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
              onClick={() => router.push('/profile')}
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