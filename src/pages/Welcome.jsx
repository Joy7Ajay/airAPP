import { useNavigate } from 'react-router-dom';

const Welcome = () => {
  const navigate = useNavigate();

  // Plane SVG component
  const Plane = ({ className, size = 40 }) => (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-gray-900 flex flex-col overflow-hidden relative">
      {/* Flying Planes Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Planes flying left to right */}
        <Plane className="flying-plane plane-right plane-1 text-blue-400/50" size={40} />
        <Plane className="flying-plane plane-right plane-2 text-indigo-400/35" size={28} />
        <Plane className="flying-plane plane-right plane-3 text-cyan-400/30" size={22} />
        <Plane className="flying-plane plane-right plane-4 text-blue-300/40" size={34} />
        {/* Planes flying right to left */}
        <Plane className="flying-plane plane-left plane-5 text-purple-400/35" size={32} />
        <Plane className="flying-plane plane-left plane-6 text-blue-400/25" size={26} />
        <Plane className="flying-plane plane-left plane-7 text-indigo-300/30" size={24} />
        {/* Planes flying bottom to top */}
        <Plane className="flying-plane plane-up plane-8 text-cyan-400/35" size={30} />
        <Plane className="flying-plane plane-up plane-9 text-purple-300/30" size={28} />
      </div>
      {/* Header */}
      <header className="p-6 animate-slide-in-left">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </div>
          <span className="text-2xl font-bold text-white">AirApp</span>
          <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full ml-2">Admin</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        {/* Admin Icon with Glow */}
        <div className="mb-8 animate-fade-in">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center animate-glow">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
        </div>

        {/* Title with Shimmer */}
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 animate-slide-in-left-delay-1 relative">
          <span className="relative">
            Airport Management System
            <span className="absolute inset-0 shimmer-effect rounded-lg"></span>
          </span>
        </h1>
        <p className="text-lg md:text-xl mb-12 max-w-lg leading-relaxed" style={{ color: '#b5bac2' }}>
          {['Secure', 'admin', 'portal', 'for', 'managing', 'airport', 'operations,', 'payments,', 'data', 'analytics,', 'and', 'system', 'monitoring.'].map((word, index) => (
            <span 
              key={index} 
              className="word-fade-hover"
              style={{ animationDelay: `${0.5 + index * 0.1}s` }}
            >
              {word}{' '}
            </span>
          ))}
        </p>

        {/* Features with Card Lift and Icon Bounce */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-2xl w-full">
          <div className="flex flex-col items-center bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 card-lift icon-bounce animate-slide-in-left-delay-1">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-3 icon-target">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-white text-sm font-medium">Payments</span>
            <span className="text-gray-500 text-xs">Track & Manage</span>
          </div>
          <div className="flex flex-col items-center bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 card-lift icon-bounce animate-slide-in-left-delay-2">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-3 icon-target">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="text-white text-sm font-medium">Analytics</span>
            <span className="text-gray-500 text-xs">Reports & Graphs</span>
          </div>
          <div className="flex flex-col items-center bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 card-lift icon-bounce animate-slide-in-left-delay-3">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-3 icon-target">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
            </div>
            <span className="text-white text-sm font-medium">Database</span>
            <span className="text-gray-500 text-xs">Data Management</span>
          </div>
          <div className="flex flex-col items-center bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 card-lift icon-bounce animate-slide-in-left-delay-4">
            <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center mb-3 icon-target">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <span className="text-white text-sm font-medium">Security</span>
            <span className="text-gray-500 text-xs">Cybersecurity</span>
          </div>
        </div>

        {/* Buttons with Ripple and Glow on Hover */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md animate-fade-in-delay-2">
          <button
            onClick={() => navigate('/login')}
            className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold py-4 px-8 rounded-xl shadow-lg shadow-blue-500/30 transform hover:-translate-y-0.5 transition-all duration-200 btn-ripple glow-on-hover"
          >
            Admin Login
          </button>
          <button
            onClick={() => navigate('/signup')}
            className="flex-1 bg-white/10 border border-white/20 text-white font-semibold py-4 px-8 rounded-xl transform hover:-translate-y-0.5 transition-all duration-200 btn-ripple glow-on-hover-secondary"
          >
            Request Access
          </button>
        </div>

        {/* Security Note */}
        <p className="mt-8 text-gray-500 text-sm flex items-center gap-2 animate-fade-in-delay-3">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Authorized personnel only. All access is logged and monitored.
        </p>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center animate-fade-in-delay-3">
        <p className="text-gray-600 text-sm">
          © 2025 AirApp Management System. Secure Admin Portal.
        </p>
      </footer>
    </div>
  );
};

export default Welcome;
