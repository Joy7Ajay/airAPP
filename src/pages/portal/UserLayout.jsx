import { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api';

const navItems = [
  { path: '/portal', key: 'overview', label: 'Overview', icon: 'M3 12h18M3 6h18M3 18h18' },
  { path: '/portal/analytics', key: 'analytics', label: 'Analytics', icon: 'M4 18h16M7 14l3-3 2 2 5-5' },
  { path: '/portal/ai-insights', key: 'ai_insights', label: 'AI Insights', icon: 'M12 3v4m0 10v4M3 12h4m10 0h4M6.2 6.2l2.8 2.8m6 6 2.8 2.8m0-11.6-2.8 2.8m-6 6-2.8 2.8' },
  { path: '/portal/predictions', key: 'predictions', label: 'Predictions', icon: 'M4 19l5-5 3 3 8-8' },
  { path: '/portal/data', key: 'data_view', label: 'Data', icon: 'M4 7h16M4 12h16M4 17h16' },
];

const routeFeatureMap = {
  '/portal': 'overview',
  '/portal/analytics': 'analytics',
  '/portal/ai-insights': 'ai_insights',
  '/portal/predictions': 'predictions',
  '/portal/data': 'data_view',
};

const getInitials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'U';

const UserLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');

  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

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

        if (!res.ok) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
          return;
        }

        if (data.user.role === 'admin') {
          navigate('/admin');
          return;
        }

        if (data.user.status !== 'approved') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
          return;
        }

        setUser(data.user);
        setPermissions(data.user.permissions || {});
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, [token, navigate]);

  const allowedNavItems = useMemo(() => {
    if (!permissions) return [];
    return navItems.filter((item) => permissions[item.key]);
  }, [permissions]);

  useEffect(() => {
    if (!permissions || checkingAuth) return;

    const requiredFeature = routeFeatureMap[location.pathname];
    if (requiredFeature && !permissions[requiredFeature]) {
      const fallback = allowedNavItems[0]?.path;
      if (fallback) {
        navigate(fallback, { replace: true });
      }
    }
  }, [permissions, checkingAuth, location.pathname, allowedNavItems, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (checkingAuth || !permissions) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (allowedNavItems.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
        <div className="max-w-md text-center bg-slate-900/60 border border-slate-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-2">No Features Assigned</h2>
          <p className="text-slate-400 text-sm">
            Your account is approved, but no portal features are enabled yet. Please contact your administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      <div className="pointer-events-none absolute -top-40 -left-32 w-96 h-96 bg-cyan-500/10 blur-3xl rounded-full" />
      <div className="pointer-events-none absolute -bottom-40 -right-24 w-96 h-96 bg-blue-500/10 blur-3xl rounded-full" />

      <header className="relative border-b border-slate-800/80 bg-slate-900/70 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-slate-950 font-bold text-sm">
              {getInitials(user?.fullName)}
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-semibold">AirApp User Portal</h1>
              <p className="text-sm text-slate-400">Welcome back, {user?.fullName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block px-3 py-2 rounded-lg border border-slate-700 bg-slate-900/80 text-sm text-slate-300">
              Enabled Features: <span className="text-cyan-400 font-semibold">{allowedNavItems.length}</span>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm border border-slate-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="relative max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-6">
        <aside className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 h-fit lg:sticky lg:top-6">
          <div className="mb-4 pb-4 border-b border-slate-800">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Workspace</p>
            <p className="text-sm font-medium text-slate-200 mt-1">User Access View</p>
          </div>

          <nav className="flex lg:flex-col gap-2">
            {allowedNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/portal'}
                className={({ isActive }) =>
                  `group px-3 py-2.5 rounded-xl text-sm transition-all flex items-center gap-2 border ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-semibold border-cyan-400/30'
                      : 'text-slate-300 hover:bg-slate-800/80 border-transparent hover:border-slate-700'
                  }`
                }
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="space-y-6">
          <Outlet context={{ user, token, permissions }} />
        </main>
      </div>
    </div>
  );
};

export default UserLayout;
