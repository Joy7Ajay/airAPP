import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });
  const [activeTab, setActiveTab] = useState('pending');
  const [isLoading, setIsLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [rejectModal, setRejectModal] = useState({ show: false, userId: null, userName: '' });
  const [rejectReason, setRejectReason] = useState('');
  
  // Security features state
  const [activeSection, setActiveSection] = useState('requests'); // 'requests', 'security', 'audit'
  const [approvedUsers, setApprovedUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [pendingTransfer, setPendingTransfer] = useState(null);
  
  // Admin transfer modal state
  const [transferModal, setTransferModal] = useState({ show: false });
  const [transferData, setTransferData] = useState({ targetUserId: '', password: '' });
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferError, setTransferError] = useState('');
  
  // Delete user modal state
  const [deleteModal, setDeleteModal] = useState({ show: false, user: null });
  const [deleteData, setDeleteData] = useState({ password: '', confirmText: '', confirmEmail: '', reason: '' });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [pendingDeletions, setPendingDeletions] = useState([]);

  const token = localStorage.getItem('token');

  // Check authentication
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const checkAuth = async () => {
      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        
        if (!res.ok || data.user.role !== 'admin') {
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }
        
        setUser(data.user);
      } catch (error) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    };

    checkAuth();
  }, [token, navigate]);

  // Fetch data
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch requests
        const reqRes = await fetch(`${API_URL}/admin/requests?status=${activeTab}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const reqData = await reqRes.json();
        setRequests(reqData.requests || []);

        // Fetch notifications
        const notifRes = await fetch(`${API_URL}/admin/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const notifData = await notifRes.json();
        setNotifications(notifData.notifications || []);
        setUnreadCount(notifData.unreadCount || 0);

        // Fetch stats
        const statsRes = await fetch(`${API_URL}/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const statsData = await statsRes.json();
        setStats(statsData.stats || { pending: 0, approved: 0, rejected: 0, total: 0 });

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, activeTab, token]);

  // Approve request
  const handleApprove = async (id, name) => {
    if (!confirm(`Approve ${name}'s access request?`)) return;
    
    setActionLoading(id);
    try {
      const res = await fetch(`${API_URL}/admin/approve/${id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        setRequests(prev => prev.filter(r => r.id !== id));
        setStats(prev => ({ ...prev, pending: prev.pending - 1, approved: prev.approved + 1 }));
        alert(`${name} has been approved!`);
      }
    } catch (error) {
      alert('Error approving request');
    } finally {
      setActionLoading(null);
    }
  };

  // Reject request
  const handleReject = async () => {
    const { userId, userName } = rejectModal;
    
    setActionLoading(userId);
    try {
      const res = await fetch(`${API_URL}/admin/reject/${userId}`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: rejectReason }),
      });
      
      if (res.ok) {
        setRequests(prev => prev.filter(r => r.id !== userId));
        setStats(prev => ({ ...prev, pending: prev.pending - 1, rejected: prev.rejected + 1 }));
        setRejectModal({ show: false, userId: null, userName: '' });
        setRejectReason('');
        alert(`${userName}'s request has been rejected.`);
      }
    } catch (error) {
      alert('Error rejecting request');
    } finally {
      setActionLoading(null);
    }
  };

  // Mark notifications as read
  const markAsRead = async () => {
    try {
      await fetch(`${API_URL}/admin/notifications/read`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: notifications.filter(n => !n.is_read).map(n => n.id) }),
      });
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
    } catch (error) {
      console.error('Error marking notifications as read');
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Fetch security data
  useEffect(() => {
    if (!user || activeSection !== 'security') return;

    const fetchSecurityData = async () => {
      try {
        // Fetch approved users for transfer selection
        const usersRes = await fetch(`${API_URL}/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const usersData = await usersRes.json();
        setApprovedUsers(usersData.users || []);

        // Fetch pending transfer status
        const transferRes = await fetch(`${API_URL}/admin/transfer/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const transferData = await transferRes.json();
        setPendingTransfer(transferData.transfer);

        // Fetch pending deletions
        const deleteRes = await fetch(`${API_URL}/admin/delete/pending`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const deleteData = await deleteRes.json();
        setPendingDeletions(deleteData.requests || []);

      } catch (error) {
        console.error('Error fetching security data:', error);
      }
    };

    fetchSecurityData();
  }, [user, activeSection, token]);

  // Fetch audit logs
  useEffect(() => {
    if (!user || activeSection !== 'audit') return;

    const fetchAuditLogs = async () => {
      try {
        const res = await fetch(`${API_URL}/admin/audit-logs?limit=100`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setAuditLogs(data.logs || []);
      } catch (error) {
        console.error('Error fetching audit logs:', error);
      }
    };

    fetchAuditLogs();
  }, [user, activeSection, token]);

  // Handle admin transfer initiation
  const handleTransferSubmit = async () => {
    setTransferError('');
    
    if (!transferData.targetUserId || !transferData.password) {
      setTransferError('Please select a user and enter your password');
      return;
    }

    setTransferLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/transfer/initiate`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transferData),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setTransferError(data.message);
        setTransferLoading(false);
        return;
      }
      
      alert(data.message);
      setTransferModal({ show: false });
      setTransferData({ targetUserId: '', password: '' });
      setPendingTransfer({ completes_at: data.completesAt });
      
    } catch (error) {
      setTransferError('Unable to connect to server');
    } finally {
      setTransferLoading(false);
    }
  };

  // Cancel admin transfer
  const handleCancelTransfer = async () => {
    if (!confirm('Are you sure you want to cancel the admin transfer?')) return;

    try {
      const res = await fetch(`${API_URL}/admin/transfer/cancel`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: 'Cancelled by admin' }),
      });
      
      if (res.ok) {
        alert('Admin transfer cancelled');
        setPendingTransfer(null);
      }
    } catch (error) {
      alert('Error cancelling transfer');
    }
  };

  // Handle delete user submission
  const handleDeleteSubmit = async () => {
    setDeleteError('');
    
    if (!deleteData.password || deleteData.confirmText !== 'DELETE' || !deleteData.confirmEmail) {
      setDeleteError('Please complete all confirmation fields');
      return;
    }

    setDeleteLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/delete/initiate`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetUserId: deleteModal.user.id,
          password: deleteData.password,
          confirmText: deleteData.confirmText,
          confirmEmail: deleteData.confirmEmail,
          reason: deleteData.reason,
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setDeleteError(data.message);
        setDeleteLoading(false);
        return;
      }
      
      alert(data.message);
      setDeleteModal({ show: false, user: null });
      setDeleteData({ password: '', confirmText: '', confirmEmail: '', reason: '' });
      
      // Refresh pending deletions
      const deleteRes = await fetch(`${API_URL}/admin/delete/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const deleteResData = await deleteRes.json();
      setPendingDeletions(deleteResData.requests || []);
      
    } catch (error) {
      setDeleteError('Unable to connect to server');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Cancel deletion request
  const handleCancelDeletion = async (deletionId) => {
    if (!confirm('Cancel this deletion request?')) return;

    try {
      const res = await fetch(`${API_URL}/admin/delete/cancel/${deletionId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        setPendingDeletions(prev => prev.filter(d => d.id !== deletionId));
        alert('Deletion request cancelled');
      }
    } catch (error) {
      alert('Error cancelling deletion');
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              <div>
                <span className="text-xl font-bold text-white">AirApp</span>
                <span className="ml-2 text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">Admin</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications && unreadCount > 0) markAsRead();
                }}
                className="relative p-2 text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-gray-800 rounded-xl shadow-xl border border-gray-700 z-50">
                  <div className="p-4 border-b border-gray-700">
                    <h3 className="font-semibold text-white">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-gray-400 text-center">No notifications</p>
                    ) : (
                      notifications.slice(0, 10).map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-4 border-b border-gray-700 ${!notif.is_read ? 'bg-blue-500/10' : ''}`}
                        >
                          <p className="text-sm text-gray-300">{notif.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{formatDate(notif.created_at)}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-white">{user.fullName}</p>
                <p className="text-xs text-gray-400">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                title="Logout"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Section Navigation */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveSection('requests')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeSection === 'requests'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Access Requests
          </button>
          <button
            onClick={() => setActiveSection('security')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeSection === 'security'
                ? 'bg-red-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Security
          </button>
          <button
            onClick={() => setActiveSection('audit')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeSection === 'audit'
                ? 'bg-purple-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Audit Logs
          </button>
        </div>

        {/* === REQUESTS SECTION === */}
        {activeSection === 'requests' && (
          <>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl p-6 border border-yellow-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-400 text-sm font-medium">Pending</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl p-6 border border-green-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-400 text-sm font-medium">Approved</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.approved}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-500/20 to-rose-500/20 rounded-xl p-6 border border-red-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-400 text-sm font-medium">Rejected</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.rejected}</p>
              </div>
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-xl p-6 border border-blue-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-400 text-sm font-medium">Total Users</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {['pending', 'approved', 'rejected'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === tab
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'pending' && stats.pending > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-yellow-500 text-yellow-900 text-xs rounded-full">
                  {stats.pending}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Requests Table */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-gray-400 mt-4">Loading...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="p-8 text-center">
              <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-gray-400">No {activeTab} requests</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-700/50">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-300">Name</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-300">Email</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-300">Date</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-300">Status</th>
                  {activeTab === 'pending' && (
                    <th className="text-right px-6 py-4 text-sm font-medium text-gray-300">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {requests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-white">{request.full_name}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-400">{request.email}</td>
                    <td className="px-6 py-4 text-gray-400 text-sm">{formatDate(request.created_at)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        request.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        request.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {request.status}
                      </span>
                    </td>
                    {activeTab === 'pending' && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleApprove(request.id, request.full_name)}
                            disabled={actionLoading === request.id}
                            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                          >
                            {actionLoading === request.id ? '...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => setRejectModal({ show: true, userId: request.id, userName: request.full_name })}
                            disabled={actionLoading === request.id}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
          </>
        )}

        {/* === SECURITY SECTION === */}
        {activeSection === 'security' && (
          <div className="space-y-8">
            {/* Admin Transfer Section */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Admin Transfer</h2>
                  <p className="text-gray-400 text-sm">Transfer admin privileges to another user</p>
                </div>
              </div>

              {pendingTransfer ? (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-yellow-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-yellow-400 font-medium">Transfer in Progress</p>
                      <p className="text-gray-400 text-sm mt-1">
                        Admin transfer is pending. Both parties must confirm via email.
                        <br />
                        Completes: {formatDate(pendingTransfer.completes_at)}
                      </p>
                      <button
                        onClick={handleCancelTransfer}
                        className="mt-3 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/30 transition-colors"
                      >
                        Cancel Transfer
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-gray-400 mb-4">
                    Transferring admin rights requires:
                  </p>
                  <ul className="list-disc list-inside text-gray-400 space-y-1 mb-6 text-sm">
                    <li>Password re-authentication</li>
                    <li>Email confirmation from both parties</li>
                    <li>48-hour waiting period</li>
                    <li>Cannot be undone easily</li>
                  </ul>
                  <button
                    onClick={() => setTransferModal({ show: true })}
                    className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Initiate Admin Transfer
                  </button>
                </div>
              )}
            </div>

            {/* Delete User Section */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Delete User</h2>
                  <p className="text-gray-400 text-sm">Soft delete with user verification</p>
                </div>
              </div>

              <p className="text-gray-400 mb-4">
                Deleting a user requires:
              </p>
              <ul className="list-disc list-inside text-gray-400 space-y-1 mb-6 text-sm">
                <li>Type "DELETE" to confirm</li>
                <li>Enter your admin email</li>
                <li>Re-authenticate with password</li>
                <li>User receives email to confirm deletion</li>
                <li><span className="text-yellow-400">30-minute response window</span> - if ignored, deletion auto-cancels</li>
                <li>Data preserved for 30 days (soft delete)</li>
              </ul>

              {/* User list for deletion */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-300 mb-3">Select a user to delete:</p>
                {approvedUsers.length === 0 ? (
                  <p className="text-gray-500">No approved users to delete</p>
                ) : (
                  <div className="grid gap-2 max-h-64 overflow-y-auto">
                    {approvedUsers.map((u) => (
                      <div
                        key={u.id}
                        className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg"
                      >
                        <div>
                          <p className="text-white font-medium">{u.full_name}</p>
                          <p className="text-gray-400 text-sm">{u.email}</p>
                        </div>
                        <button
                          onClick={() => setDeleteModal({ show: true, user: u })}
                          className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/30 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pending Deletions */}
              {pendingDeletions.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4">Pending Deletions</h3>
                  <div className="space-y-2">
                    {pendingDeletions.map((d) => {
                      const expiresAt = d.expires_at ? new Date(d.expires_at) : null;
                      const now = new Date();
                      const isExpired = expiresAt && expiresAt < now;
                      const minutesLeft = expiresAt ? Math.max(0, Math.ceil((expiresAt - now) / 60000)) : null;
                      
                      return (
                        <div
                          key={d.id}
                          className={`flex items-center justify-between p-3 rounded-lg ${
                            isExpired 
                              ? 'bg-gray-500/10 border border-gray-500/30' 
                              : 'bg-yellow-500/10 border border-yellow-500/30'
                          }`}
                        >
                          <div>
                            <p className={`font-medium ${isExpired ? 'text-gray-400' : 'text-yellow-400'}`}>
                              {d.target_name}
                            </p>
                            <p className="text-gray-400 text-sm">
                              {isExpired 
                                ? 'Expired - auto-cancelled (user did not respond)'
                                : minutesLeft !== null 
                                  ? `Waiting for user verification (${minutesLeft} min left)`
                                  : 'Waiting for user verification'
                              }
                            </p>
                          </div>
                          {!isExpired && (
                            <button
                              onClick={() => handleCancelDeletion(d.id)}
                              className="px-3 py-1.5 bg-gray-700 text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* === AUDIT LOGS SECTION === */}
        {activeSection === 'audit' && (
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Audit Logs</h2>
                  <p className="text-gray-400 text-sm">Complete history of all security-related actions</p>
                </div>
              </div>
            </div>

            <div className="max-h-[600px] overflow-y-auto">
              {auditLogs.length === 0 ? (
                <p className="p-8 text-center text-gray-400">No audit logs yet</p>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-700/50 sticky top-0">
                    <tr>
                      <th className="text-left px-6 py-3 text-sm font-medium text-gray-300">Action</th>
                      <th className="text-left px-6 py-3 text-sm font-medium text-gray-300">Category</th>
                      <th className="text-left px-6 py-3 text-sm font-medium text-gray-300">User</th>
                      <th className="text-left px-6 py-3 text-sm font-medium text-gray-300">Target</th>
                      <th className="text-left px-6 py-3 text-sm font-medium text-gray-300">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-700/30">
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            log.action.includes('failed') ? 'bg-red-500/20 text-red-400' :
                            log.action.includes('success') || log.action.includes('approved') || log.action.includes('completed') ? 'bg-green-500/20 text-green-400' :
                            log.action.includes('initiated') || log.action.includes('sent') ? 'bg-blue-500/20 text-blue-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {log.action.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            log.category === 'security' ? 'bg-red-500/20 text-red-400' :
                            log.category === 'auth' ? 'bg-blue-500/20 text-blue-400' :
                            log.category === 'admin' ? 'bg-purple-500/20 text-purple-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {log.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-300 text-sm">
                          {log.user_name || log.user_email || '-'}
                        </td>
                        <td className="px-6 py-4 text-gray-300 text-sm">
                          {log.target_name || log.target_email || '-'}
                        </td>
                        <td className="px-6 py-4 text-gray-400 text-sm">
                          {formatDate(log.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Reject Modal */}
      {rejectModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">Reject Request</h3>
            <p className="text-gray-400 mb-4">
              Are you sure you want to reject <span className="text-white font-medium">{rejectModal.userName}</span>'s access request?
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Reason (optional)
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows={3}
                placeholder="Enter reason for rejection..."
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setRejectModal({ show: false, userId: null, userName: '' });
                  setRejectReason('');
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {actionLoading ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Transfer Modal */}
      {transferModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4 border border-gray-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Transfer Admin Role</h3>
                <p className="text-gray-400 text-sm">This action cannot be undone easily</p>
              </div>
            </div>

            {transferError && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm">{transferError}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Select New Admin
                </label>
                <select
                  value={transferData.targetUserId}
                  onChange={(e) => setTransferData({ ...transferData, targetUserId: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Choose a user...</option>
                  {approvedUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.full_name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Your Password (Re-authenticate)
                </label>
                <input
                  type="password"
                  value={transferData.password}
                  onChange={(e) => setTransferData({ ...transferData, password: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mt-4">
              <p className="text-yellow-400 text-sm">
                <strong>Warning:</strong> Both you and the new admin must confirm via email. 
                The transfer will complete after 48 hours.
              </p>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => {
                  setTransferModal({ show: false });
                  setTransferData({ targetUserId: '', password: '' });
                  setTransferError('');
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleTransferSubmit}
                disabled={transferLoading}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {transferLoading ? 'Processing...' : 'Initiate Transfer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {deleteModal.show && deleteModal.user && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4 border border-gray-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Delete User</h3>
                <p className="text-gray-400 text-sm">{deleteModal.user.full_name}</p>
              </div>
            </div>

            {deleteError && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm">{deleteError}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Type <span className="text-red-400 font-bold">DELETE</span> to confirm
                </label>
                <input
                  type="text"
                  value={deleteData.confirmText}
                  onChange={(e) => setDeleteData({ ...deleteData, confirmText: e.target.value })}
                  className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                    deleteData.confirmText === 'DELETE' ? 'border-green-500' : 'border-gray-600'
                  }`}
                  placeholder="Type DELETE"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Enter your admin email ({user?.email})
                </label>
                <input
                  type="email"
                  value={deleteData.confirmEmail}
                  onChange={(e) => setDeleteData({ ...deleteData, confirmEmail: e.target.value })}
                  className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                    deleteData.confirmEmail === user?.email ? 'border-green-500' : 'border-gray-600'
                  }`}
                  placeholder="Your admin email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Your Password
                </label>
                <input
                  type="password"
                  value={deleteData.password}
                  onChange={(e) => setDeleteData({ ...deleteData, password: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter your password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Reason (optional)
                </label>
                <textarea
                  value={deleteData.reason}
                  onChange={(e) => setDeleteData({ ...deleteData, reason: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  rows={2}
                  placeholder="Reason for deletion"
                />
              </div>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mt-4">
              <p className="text-yellow-400 text-sm">
                <strong>Note:</strong> The user will receive an email to verify this deletion.
                <br />• User has <strong>30 minutes</strong> to respond
                <br />• If ignored, deletion is <strong>automatically cancelled</strong>
                <br />• Data preserved for 30 days after deletion
              </p>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => {
                  setDeleteModal({ show: false, user: null });
                  setDeleteData({ password: '', confirmText: '', confirmEmail: '', reason: '' });
                  setDeleteError('');
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSubmit}
                disabled={deleteLoading || deleteData.confirmText !== 'DELETE' || deleteData.confirmEmail !== user?.email}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteLoading ? 'Processing...' : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
