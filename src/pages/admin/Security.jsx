import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api';

const Security = () => {
  const { user, token } = useOutletContext();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Security data
  const [approvedUsers, setApprovedUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [pendingTransfer, setPendingTransfer] = useState(null);
  const [pendingDeletions, setPendingDeletions] = useState([]);
  
  // Modals
  const [transferModal, setTransferModal] = useState({ show: false });
  const [transferData, setTransferData] = useState({ targetUserId: '', password: '' });
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferError, setTransferError] = useState('');
  
  const [deleteModal, setDeleteModal] = useState({ show: false, user: null });
  const [deleteData, setDeleteData] = useState({ password: '', confirmText: '', confirmEmail: '', reason: '' });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Security stats
  const securityStats = {
    securityScore: 94,
    threatsBlocked: 48,
    activeSessions: 1884,
    apiKeys: 242,
  };

  // Fetch security data
  useEffect(() => {
    const fetchSecurityData = async () => {
      setIsLoading(true);
      try {
        // Fetch approved users
        const usersRes = await fetch(`${API_URL}/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const usersData = await usersRes.json();
        setApprovedUsers(usersData.users || []);

        // Fetch pending transfer
        const transferRes = await fetch(`${API_URL}/admin/transfer/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const transferData = await transferRes.json();
        setPendingTransfer(transferData.transfer);

        // Fetch pending deletions
        const deleteRes = await fetch(`${API_URL}/admin/delete/pending`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const deleteResData = await deleteRes.json();
        setPendingDeletions(deleteResData.requests || []);

        // Fetch audit logs
        const logsRes = await fetch(`${API_URL}/admin/audit-logs?limit=50`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const logsData = await logsRes.json();
        setAuditLogs(logsData.logs || []);

      } catch (error) {
        console.error('Error fetching security data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSecurityData();
  }, [token]);

  // Handle admin transfer
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
    if (!confirm('Cancel the admin transfer?')) return;

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

  // Handle delete user
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

  // Cancel deletion
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-slate-400 mt-4">Loading security dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            Security Dashboard
          </h1>
          <p className="text-slate-400 mt-1">Monitor system health, risk indicators, and security activities.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm">Security Score</span>
            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-white mt-2">{securityStats.securityScore}/100</p>
          <span className="text-green-400 text-xs">Excellent</span>
        </div>

        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm">Threats Blocked</span>
            <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-white mt-2">{securityStats.threatsBlocked}</p>
          <span className="text-slate-500 text-xs">This month</span>
        </div>

        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm">Active Sessions</span>
            <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-white mt-2">{securityStats.activeSessions.toLocaleString()}</p>
          <span className="text-slate-500 text-xs">Currently</span>
        </div>

        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm">API Keys</span>
            <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-white mt-2">{securityStats.apiKeys}</p>
          <span className="text-slate-500 text-xs">Active</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { id: 'overview', label: 'Overview', icon: '📊' },
          { id: 'admin-transfer', label: 'Admin Transfer', icon: '🔄' },
          { id: 'user-deletion', label: 'User Deletion', icon: '🗑️' },
          { id: 'audit-logs', label: 'Audit Logs', icon: '📋' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-cyan-500 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Threat Detection Chart */}
          <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">Threat Detection</h2>
              <span className="text-xs text-slate-400">Last 7 days</span>
            </div>

            <div className="h-40 relative">
              <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
                {/* Normal line */}
                <path
                  d="M0,80 Q50,75 100,70 T200,60 T300,50"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2"
                />
                {/* Threat line */}
                <path
                  d="M0,90 Q50,85 100,82 T200,78 T300,75"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="2"
                />
              </svg>
            </div>

            <div className="flex items-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-slate-400">Normal Traffic</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-slate-400">Blocked Threats</span>
              </div>
            </div>
          </div>

          {/* Recent Security Events */}
          <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">Recent Security Events</h2>
              <span className="text-xs text-slate-400">Today</span>
            </div>

            <div className="space-y-3">
              {[
                { type: 'warning', message: 'Failed Login Attempt', ip: '192.168.1.xxx', time: '2 min ago' },
                { type: 'success', message: 'New API Key Generated', user: 'Admin', time: '15 min ago' },
                { type: 'warning', message: 'Failed Login Attempt', ip: '10.0.0.xxx', time: '32 min ago' },
              ].map((event, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      event.type === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}></div>
                    <div>
                      <p className="text-white text-sm">{event.message}</p>
                      <p className="text-slate-500 text-xs">{event.ip || event.user}</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500">{event.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Admin Transfer Tab */}
      {activeTab === 'admin-transfer' && (
        <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Admin Transfer</h2>
              <p className="text-slate-400 text-sm">Transfer admin privileges to another user</p>
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
                  <p className="text-slate-400 text-sm mt-1">
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
              <p className="text-slate-400 mb-4">Transferring admin rights requires:</p>
              <ul className="list-disc list-inside text-slate-400 space-y-1 mb-6 text-sm">
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
      )}

      {/* User Deletion Tab */}
      {activeTab === 'user-deletion' && (
        <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Delete User</h2>
              <p className="text-slate-400 text-sm">Soft delete with user verification</p>
            </div>
          </div>

          <p className="text-slate-400 mb-4">Deleting a user requires:</p>
          <ul className="list-disc list-inside text-slate-400 space-y-1 mb-6 text-sm">
            <li>Type "DELETE" to confirm</li>
            <li>Enter your admin email</li>
            <li>Re-authenticate with password</li>
            <li>User receives email to confirm deletion</li>
            <li><span className="text-yellow-400">30-minute response window</span> - if ignored, deletion auto-cancels</li>
            <li>Data preserved for 30 days (soft delete)</li>
          </ul>

          {/* User list */}
          <div className="space-y-2 mb-6">
            <p className="text-sm font-medium text-slate-300 mb-3">Select a user to delete:</p>
            {approvedUsers.length === 0 ? (
              <p className="text-slate-500">No approved users to delete</p>
            ) : (
              <div className="grid gap-2 max-h-64 overflow-y-auto">
                {approvedUsers.map((u) => (
                  <div key={u.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <div>
                      <p className="text-white font-medium">{u.full_name}</p>
                      <p className="text-slate-400 text-sm">{u.email}</p>
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
            <div className="pt-6 border-t border-slate-800">
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
                          ? 'bg-slate-500/10 border border-slate-500/30' 
                          : 'bg-yellow-500/10 border border-yellow-500/30'
                      }`}
                    >
                      <div>
                        <p className={`font-medium ${isExpired ? 'text-slate-400' : 'text-yellow-400'}`}>
                          {d.target_name}
                        </p>
                        <p className="text-slate-400 text-sm">
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
                          className="px-3 py-1.5 bg-slate-700 text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-600 transition-colors"
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
      )}

      {/* Audit Logs Tab */}
      {activeTab === 'audit-logs' && (
        <div className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Audit Logs</h2>
                <p className="text-slate-400 text-sm">Complete history of all security-related actions</p>
              </div>
            </div>
          </div>

          <div className="max-h-[500px] overflow-y-auto">
            {auditLogs.length === 0 ? (
              <p className="p-8 text-center text-slate-400">No audit logs yet</p>
            ) : (
              <table className="w-full">
                <thead className="bg-slate-800/50 sticky top-0">
                  <tr>
                    <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Action</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Category</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">User</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Target</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/30">
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          log.action.includes('failed') ? 'bg-red-500/20 text-red-400' :
                          log.action.includes('success') || log.action.includes('approved') || log.action.includes('completed') ? 'bg-green-500/20 text-green-400' :
                          log.action.includes('initiated') || log.action.includes('sent') ? 'bg-blue-500/20 text-blue-400' :
                          'bg-slate-500/20 text-slate-400'
                        }`}>
                          {log.action.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          log.category === 'security' ? 'bg-red-500/20 text-red-400' :
                          log.category === 'auth' ? 'bg-blue-500/20 text-blue-400' :
                          log.category === 'admin' ? 'bg-purple-500/20 text-purple-400' :
                          'bg-slate-500/20 text-slate-400'
                        }`}>
                          {log.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-300 text-sm">
                        {log.user_name || log.user_email || '-'}
                      </td>
                      <td className="px-6 py-4 text-slate-300 text-sm">
                        {log.target_name || log.target_email || '-'}
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-sm">
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

      {/* Admin Transfer Modal */}
      {transferModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md mx-4 border border-slate-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Transfer Admin Role</h3>
                <p className="text-slate-400 text-sm">This action cannot be undone easily</p>
              </div>
            </div>

            {transferError && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm">{transferError}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Select New Admin</label>
                <select
                  value={transferData.targetUserId}
                  onChange={(e) => setTransferData({ ...transferData, targetUserId: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Choose a user...</option>
                  {approvedUsers.map((u) => (
                    <option key={u.id} value={u.id}>{u.full_name} ({u.email})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Your Password</label>
                <input
                  type="password"
                  value={transferData.password}
                  onChange={(e) => setTransferData({ ...transferData, password: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
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
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md mx-4 border border-slate-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Delete User</h3>
                <p className="text-slate-400 text-sm">{deleteModal.user.full_name}</p>
              </div>
            </div>

            {deleteError && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm">{deleteError}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Type <span className="text-red-400 font-bold">DELETE</span> to confirm
                </label>
                <input
                  type="text"
                  value={deleteData.confirmText}
                  onChange={(e) => setDeleteData({ ...deleteData, confirmText: e.target.value })}
                  className={`w-full px-4 py-3 bg-slate-700 border rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                    deleteData.confirmText === 'DELETE' ? 'border-green-500' : 'border-slate-600'
                  }`}
                  placeholder="Type DELETE"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Enter your admin email ({user?.email})
                </label>
                <input
                  type="email"
                  value={deleteData.confirmEmail}
                  onChange={(e) => setDeleteData({ ...deleteData, confirmEmail: e.target.value })}
                  className={`w-full px-4 py-3 bg-slate-700 border rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                    deleteData.confirmEmail === user?.email ? 'border-green-500' : 'border-slate-600'
                  }`}
                  placeholder="Your admin email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Your Password</label>
                <input
                  type="password"
                  value={deleteData.password}
                  onChange={(e) => setDeleteData({ ...deleteData, password: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter your password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Reason (optional)</label>
                <textarea
                  value={deleteData.reason}
                  onChange={(e) => setDeleteData({ ...deleteData, reason: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
              </p>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => {
                  setDeleteModal({ show: false, user: null });
                  setDeleteData({ password: '', confirmText: '', confirmEmail: '', reason: '' });
                  setDeleteError('');
                }}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
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

export default Security;
