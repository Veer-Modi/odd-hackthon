'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Plus, Search, Filter, Download, Check, X as XIcon,
  ArrowLeft, Clock, FileText, User, AlertCircle, CheckCircle, TrendingUp,
  Upload, X, Loader, Paperclip, Eye
} from 'lucide-react';

export default function LeavePage() {
  const router = useRouter();
  const [leaves, setLeaves] = useState<any[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ path: string; name: string } | null>(null);
  const [formData, setFormData] = useState({
    leaveTypeId: '',
    startDate: '',
    endDate: '',
    reason: '',
    attachmentPath: '',
    attachmentName: '',
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      // Fetch leave types
      const typesRes = await fetch('/api/leave/types', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (typesRes.ok) {
        const typesData = await typesRes.json();
        setLeaveTypes(typesData);
        if (typesData.length > 0) {
          setFormData(prev => ({ ...prev, leaveTypeId: typesData[0].id.toString() }));
        }
      }

      // Fetch leave requests
      const leavesRes = await fetch('/api/leave', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (leavesRes.ok) {
        const leavesData = await leavesRes.json();
        setLeaves(leavesData);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    const token = localStorage.getItem('token');
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setUploadedFile({ path: data.path, name: data.name });
        setFormData(prev => ({
          ...prev,
          attachmentPath: data.path,
          attachmentName: data.name,
        }));
      } else {
        const error = await response.json();
        alert(error.error || 'File upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (!formData.leaveTypeId || !formData.startDate || !formData.endDate || !formData.reason) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('/api/leave', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchData();
        setShowModal(false);
        setFormData({
          leaveTypeId: leaveTypes.length > 0 ? leaveTypes[0].id.toString() : '',
          startDate: '',
          endDate: '',
          reason: '',
          attachmentPath: '',
          attachmentName: '',
        });
        setUploadedFile(null);
        alert('Leave request submitted successfully! HR will be notified.');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to submit leave request');
      }
    } catch (error) {
      console.error('Failed to apply leave:', error);
      alert('Failed to submit leave request. Please try again.');
    }
  };

  const handleApprove = async (leaveId: number) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/leave/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ leaveId, status: 'Approved' }),
      });

      if (response.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Failed to approve leave:', error);
    }
  };

  const handleReject = async (leaveId: number) => {
    const token = localStorage.getItem('token');
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      const response = await fetch(`/api/leave/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ leaveId, status: 'Rejected', rejectionReason: reason }),
      });

      if (response.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Failed to reject leave:', error);
    }
  };

  const filteredLeaves = leaves.filter(leave =>
    leave.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    leave.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    leave.leave_type_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: leaves.length,
    pending: leaves.filter(l => l.status?.toLowerCase() === 'pending').length,
    approved: leaves.filter(l => l.status?.toLowerCase() === 'approved').length,
    rejected: leaves.filter(l => l.status?.toLowerCase() === 'rejected').length,
  };

  const canApprove = user?.role === 'admin' || user?.role === 'hr';

  // Calculate leave balance (simplified)
  const leaveBalance = {
    total: 25,
    used: leaves.filter(l => l.status?.toLowerCase() === 'approved').reduce((sum, l) => sum + (l.total_days || 0), 0),
    available: 25 - leaves.filter(l => l.status?.toLowerCase() === 'approved').reduce((sum, l) => sum + (l.total_days || 0), 0),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <button
              onClick={() => router.push('/dashboard/employee')}
              className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 mb-2 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </button>
            <h1 className="text-4xl font-black gradient-text">Leave Management</h1>
            <p className="text-slate-600 mt-2">Apply for leave and manage your time-off requests</p>
          </div>
          {(['employee', 'hr', 'payroll_officer'] as any[]).includes(user?.role) && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowModal(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Apply Leave</span>
            </motion.button>
          )}
        </motion.div>
      </div>

      {/* Statistics */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={<FileText className="h-5 w-5" />}
            label="Total Requests"
            value={stats.total}
            color="from-blue-500 to-blue-600"
          />
          <StatCard
            icon={<Clock className="h-5 w-5" />}
            label="Pending"
            value={stats.pending}
            color="from-yellow-500 to-orange-500"
          />
          <StatCard
            icon={<CheckCircle className="h-5 w-5" />}
            label="Approved"
            value={stats.approved}
            color="from-green-500 to-green-600"
          />
          <StatCard
            icon={<AlertCircle className="h-5 w-5" />}
            label="Rejected"
            value={stats.rejected}
            color="from-red-500 to-red-600"
          />
        </div>
      </div>

      {/* Leave Balance Card */}
      {(['employee', 'hr', 'payroll_officer'] as any[]).includes(user?.role) && (
        <div className="max-w-7xl mx-auto mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="premium-card relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl" />
            <div className="relative grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center text-white mx-auto mb-3 shadow-lg">
                  <Calendar className="h-8 w-8" />
                </div>
                <p className="text-3xl font-black gradient-text">{leaveBalance.total}</p>
                <p className="text-sm text-slate-600 font-semibold mt-1">Total Leave</p>
              </div>
              <div className="text-center">
                <div className="bg-gradient-to-br from-green-500 to-green-600 w-16 h-16 rounded-2xl flex items-center justify-center text-white mx-auto mb-3 shadow-lg">
                  <TrendingUp className="h-8 w-8" />
                </div>
                <p className="text-3xl font-black text-slate-900">{leaveBalance.available}</p>
                <p className="text-sm text-slate-600 font-semibold mt-1">Available</p>
              </div>
              <div className="text-center">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center text-white mx-auto mb-3 shadow-lg">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <p className="text-3xl font-black text-slate-900">{leaveBalance.used}</p>
                <p className="text-sm text-slate-600 font-semibold mt-1">Used</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Search & Filter */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="premium-card flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search leave requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-premium pl-12"
            />
          </div>
        </div>
      </div>

      {/* Leave Requests */}
      <div className="max-w-7xl mx-auto">
        <div className="premium-card">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="skeleton h-24 rounded-lg" />
              ))}
            </div>
          ) : filteredLeaves.length > 0 ? (
            <div className="space-y-4">
              {filteredLeaves.map((leave, idx) => (
                <motion.div
                  key={leave.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ x: 5 }}
                  className="glass p-6 rounded-2xl border border-white/20 hover:border-blue-200 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-3 rounded-xl">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-bold text-slate-900">
                            {leave.first_name} {leave.last_name}
                          </h3>
                          <span className={`badge ${
                            leave.status?.toLowerCase() === 'approved' ? 'badge-success' :
                            leave.status?.toLowerCase() === 'rejected' ? 'badge-danger' :
                            'badge-warning'
                          }`}>
                            {leave.status}
                          </span>
                          {leave.employee_code && (
                            <span className="text-sm text-slate-500">({leave.employee_code})</span>
                          )}
                        </div>
                        <div className="grid md:grid-cols-3 gap-4 mb-3">
                          <div className="flex items-center space-x-2 text-sm">
                            <Calendar className="h-4 w-4 text-blue-500" />
                            <span className="text-slate-600">
                              <span className="font-semibold">{leave.leave_type_name}</span>
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            <Clock className="h-4 w-4 text-purple-500" />
                            <span className="text-slate-600">
                              {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            <FileText className="h-4 w-4 text-green-500" />
                            <span className="text-slate-600">
                              {leave.total_days} {leave.total_days === 1 ? 'day' : 'days'}
                            </span>
                          </div>
                        </div>
                        <p className="text-slate-600 text-sm bg-slate-50 p-3 rounded-lg mb-2">
                          <span className="font-semibold">Reason:</span> {leave.reason}
                        </p>
                        {leave.attachment_path && (
                          <div className="flex items-center space-x-2 text-sm text-blue-600">
                            <Paperclip className="h-4 w-4" />
                            <a
                              href={leave.attachment_path}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-1 hover:underline"
                            >
                              <span>{leave.attachment_name || 'View Attachment'}</span>
                              <Eye className="h-3 w-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {canApprove && leave.status?.toLowerCase() === 'pending' && (
                      <div className="flex space-x-2 ml-4">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleApprove(leave.id)}
                          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white p-3 rounded-xl shadow-lg transition-all"
                          title="Approve"
                        >
                          <Check className="h-5 w-5" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleReject(leave.id)}
                          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white p-3 rounded-xl shadow-lg transition-all"
                          title="Reject"
                        >
                          <XIcon className="h-5 w-5" />
                        </motion.button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">No Leave Requests</h3>
              <p className="text-slate-600">No leave requests found</p>
            </div>
          )}
        </div>
      </div>

      {/* Apply Leave Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass backdrop-blur-xl rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold gradient-text">Apply for Leave</h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setUploadedFile(null);
                    setFormData({
                      leaveTypeId: leaveTypes.length > 0 ? leaveTypes[0].id.toString() : '',
                      startDate: '',
                      endDate: '',
                      reason: '',
                      attachmentPath: '',
                      attachmentName: '',
                    });
                  }}
                  className="p-2 hover:bg-white/50 rounded-xl transition-colors"
                >
                  <XIcon className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Leave Type *
                  </label>
                  <select
                    required
                    value={formData.leaveTypeId}
                    onChange={(e) => setFormData({ ...formData, leaveTypeId: e.target.value })}
                    className="input-premium"
                  >
                    <option value="">Select Leave Type</option>
                    {leaveTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name} ({type.days_allowed} days allowed)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="input-premium"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      End Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="input-premium"
                      min={formData.startDate || new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Reason *
                  </label>
                  <textarea
                    required
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    className="input-premium"
                    rows={4}
                    placeholder="Please provide a reason for your leave request..."
                  />
                </div>

                {/* File Upload Section */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Attachment (Optional)
                    <span className="text-xs text-slate-500 ml-2">Upload doctor's note or supporting document (PDF, JPEG, PNG - Max 5MB)</span>
                  </label>
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                    {uploadedFile ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-center space-x-2 text-green-600">
                          <CheckCircle className="h-5 w-5" />
                          <span className="font-semibold">File uploaded successfully</span>
                        </div>
                        <div className="flex items-center justify-center space-x-2">
                          <Paperclip className="h-4 w-4 text-slate-600" />
                          <span className="text-sm text-slate-600">{uploadedFile.name}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setUploadedFile(null);
                              setFormData(prev => ({ ...prev, attachmentPath: '', attachmentName: '' }));
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <input
                          type="file"
                          id="file-upload"
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 5 * 1024 * 1024) {
                                alert('File size must be less than 5MB');
                                return;
                              }
                              handleFileUpload(file);
                            }
                          }}
                          disabled={uploading}
                        />
                        <label
                          htmlFor="file-upload"
                          className="cursor-pointer flex flex-col items-center space-y-2"
                        >
                          {uploading ? (
                            <>
                              <Loader className="h-8 w-8 text-blue-600 animate-spin" />
                              <span className="text-sm text-slate-600">Uploading...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="h-8 w-8 text-slate-400" />
                              <span className="text-sm text-slate-600">
                                Click to upload or drag and drop
                              </span>
                              <span className="text-xs text-slate-500">
                                PDF, JPEG, PNG (Max 5MB)
                              </span>
                            </>
                          )}
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setUploadedFile(null);
                      setFormData({
                        leaveTypeId: leaveTypes.length > 0 ? leaveTypes[0].id.toString() : '',
                        startDate: '',
                        endDate: '',
                        reason: '',
                        attachmentPath: '',
                        attachmentName: '',
                      });
                    }}
                    className="flex-1 glass px-6 py-3 rounded-xl font-semibold hover:bg-white/80 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-primary"
                    disabled={uploading}
                  >
                    {uploading ? 'Uploading...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ icon, label, value, color }: any) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="premium-card"
    >
      <div className={`bg-gradient-to-br ${color} w-10 h-10 rounded-xl flex items-center justify-center text-white mb-3 shadow-lg`}>
        {icon}
      </div>
      <p className="text-sm text-slate-600 font-semibold">{label}</p>
      <p className="text-2xl font-black text-slate-900">{value}</p>
    </motion.div>
  );
}