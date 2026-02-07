import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Welcome = () => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Get current hour and determine if it's night time
  const currentHour = new Date().getHours();
  const isNightTime = currentHour >= 18 || currentHour < 6; // 6 PM - 6 AM
  const isDark = isNightTime; // UI theme follows time

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

  // Background images for time-based display
  const darkBgImage = '/images/welcome/485798569_1210287077193497_3667196745893921462_n.jpg';
  const lightBgImage = '/images/welcome/Passenger-terminal-outlook.jpg';

  // Day images (6 AM - 6 PM)
  const dayImages = [lightBgImage];
  
  // Night images (6 PM - 6 AM)
  const nightImages = [darkBgImage];

  // Select images based on time
  const backgroundImages = isNightTime ? nightImages : dayImages;

  // Change background image every 5 seconds (for when more images are added)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  return (
    <div className={`min-h-screen flex flex-col overflow-hidden relative ${isDark ? 'theme-dark' : 'theme-light'}`}>
      {/* Background Image Slideshow - Time Based */}
      {backgroundImages.map((img, index) => (
        <div
          key={index}
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
          style={{
            backgroundImage: `url(${img})`,
            opacity: index === currentImageIndex ? 1 : 0,
          }}
        />
      ))}
      {/* Overlay for readability */}
      <div className={`absolute inset-0 transition-colors duration-500 ${
        isDark 
          ? 'bg-slate-900/80' 
          : 'bg-white/55'
      }`} />
      {/* Flying Planes Background - Uganda Flag Colors (Black, Yellow, Red) + Blue */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
        {/* Planes flying left to right */}
        <Plane className={`flying-plane plane-right plane-1 ${isDark ? 'text-blue-400/50' : 'text-blue-600/60'}`} size={40} />
        <Plane className={`flying-plane plane-right plane-2 ${isDark ? 'text-yellow-400/50' : 'text-yellow-500/70'}`} size={28} />
        <Plane className={`flying-plane plane-right plane-3 ${isDark ? 'text-red-400/45' : 'text-red-600/60'}`} size={22} />
        <Plane className={`flying-plane plane-right plane-4 ${isDark ? 'text-gray-300/40' : 'text-gray-800/50'}`} size={34} />
        {/* Planes flying right to left */}
        <Plane className={`flying-plane plane-left plane-5 ${isDark ? 'text-yellow-300/45' : 'text-yellow-600/65'}`} size={32} />
        <Plane className={`flying-plane plane-left plane-6 ${isDark ? 'text-blue-300/40' : 'text-blue-500/55'}`} size={26} />
        <Plane className={`flying-plane plane-left plane-7 ${isDark ? 'text-red-300/40' : 'text-red-500/55'}`} size={24} />
        {/* Planes flying bottom to top */}
        <Plane className={`flying-plane plane-up plane-8 ${isDark ? 'text-gray-400/35' : 'text-gray-700/50'}`} size={30} />
        <Plane className={`flying-plane plane-up plane-9 ${isDark ? 'text-blue-300/35' : 'text-blue-400/50'}`} size={28} />
      </div>
      {/* Header */}
      <header className="p-6 animate-slide-in-left relative z-20">
        <div className="flex items-center justify-between">
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
            <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>AirApp</span>
            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full ml-2">Admin</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center relative z-20">
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
        <h1 className={`text-4xl md:text-5xl font-bold mb-4 animate-slide-in-left-delay-1 relative ${isDark ? 'text-white' : 'text-gray-900'}`}>
          <span className="relative">
            Airport Management System
            <span className="absolute inset-0 shimmer-effect rounded-lg"></span>
          </span>
        </h1>
        <p className={`text-lg md:text-xl mb-12 max-w-lg leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
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
          <div className={`flex flex-col items-center backdrop-blur-sm rounded-xl p-4 border card-lift icon-bounce animate-slide-in-left-delay-1 ${
            isDark ? 'bg-white/5 border-white/10' : 'bg-white/80 border-gray-200 shadow-lg'
          }`}>
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-3 icon-target">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Payments</span>
            <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Track & Manage</span>
          </div>
          <div className={`flex flex-col items-center backdrop-blur-sm rounded-xl p-4 border card-lift icon-bounce animate-slide-in-left-delay-2 ${
            isDark ? 'bg-white/5 border-white/10' : 'bg-white/80 border-gray-200 shadow-lg'
          }`}>
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-3 icon-target">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Analytics</span>
            <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Reports & Graphs</span>
          </div>
          <div className={`flex flex-col items-center backdrop-blur-sm rounded-xl p-4 border card-lift icon-bounce animate-slide-in-left-delay-3 ${
            isDark ? 'bg-white/5 border-white/10' : 'bg-white/80 border-gray-200 shadow-lg'
          }`}>
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-3 icon-target">
              <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
            </div>
            <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Database</span>
            <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Data Management</span>
          </div>
          <div className={`flex flex-col items-center backdrop-blur-sm rounded-xl p-4 border card-lift icon-bounce animate-slide-in-left-delay-4 ${
            isDark ? 'bg-white/5 border-white/10' : 'bg-white/80 border-gray-200 shadow-lg'
          }`}>
            <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center mb-3 icon-target">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Security</span>
            <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Cybersecurity</span>
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
            className={`flex-1 font-semibold py-4 px-8 rounded-xl transform hover:-translate-y-0.5 transition-all duration-200 btn-ripple ${
              isDark 
                ? 'bg-white/10 border border-white/20 text-white glow-on-hover-secondary' 
                : 'bg-gray-800 text-white hover:bg-gray-700'
            }`}
          >
            Request Access
          </button>
        </div>

        {/* Security Note */}
        <p className={`mt-8 text-sm flex items-center gap-2 animate-fade-in-delay-3 ${isDark ? 'text-gray-500' : 'text-gray-700'}`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Authorized personnel only. All access is logged and monitored.
        </p>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center animate-fade-in-delay-3 relative z-20">
        <p className={`text-sm ${isDark ? 'text-gray-600' : 'text-gray-700'}`}>
          © 2025 AirApp Management System. Secure Admin Portal.
        </p>
      </footer>
    </div>
  );
};

export default Welcome;
