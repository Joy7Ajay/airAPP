import { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';

const Data = () => {
  const { user, token } = useOutletContext();
  const [isLoading, setIsLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('3M');
  const bubbleContainerRef = useRef(null);

  // Storage stats
  const [storage, setStorage] = useState({
    total: 438.6,
    used: 312.4,
    growth: 15.2,
    activeQueries: 1234,
  });

  // Bubble chart data - Data categories with sizes
  const bubbleData = {
    '1W': [
      { name: 'Flight Records', value: 12450, size: 85, x: 50, y: 45 },
      { name: 'Passengers', value: 8320, size: 65, x: 25, y: 35 },
      { name: 'Airlines', value: 4680, size: 50, x: 75, y: 30 },
      { name: 'Routes', value: 3240, size: 45, x: 30, y: 70 },
      { name: 'Airports', value: 2890, size: 40, x: 70, y: 65 },
    ],
    '1M': [
      { name: 'Flight Records', value: 54820, size: 90, x: 50, y: 45 },
      { name: 'Passengers', value: 38540, size: 70, x: 25, y: 35 },
      { name: 'Airlines', value: 18920, size: 55, x: 75, y: 28 },
      { name: 'Routes', value: 14560, size: 48, x: 28, y: 72 },
      { name: 'Airports', value: 11230, size: 42, x: 72, y: 68 },
    ],
    '3M': [
      { name: 'Flight Records', value: 168420, size: 100, x: 50, y: 45 },
      { name: 'Passengers', value: 124680, size: 78, x: 22, y: 32 },
      { name: 'Airlines', value: 56890, size: 60, x: 78, y: 25 },
      { name: 'Routes', value: 42350, size: 52, x: 25, y: 75 },
      { name: 'Airports', value: 31240, size: 45, x: 75, y: 70 },
    ],
    '1Y': [
      { name: 'Flight Records', value: 684520, size: 110, x: 50, y: 45 },
      { name: 'Passengers', value: 512340, size: 85, x: 20, y: 30 },
      { name: 'Airlines', value: 234560, size: 68, x: 80, y: 22 },
      { name: 'Routes', value: 178940, size: 58, x: 22, y: 78 },
      { name: 'Airports', value: 124680, size: 50, x: 78, y: 72 },
    ],
    'ALL': [
      { name: 'Flight Records', value: 2458920, size: 120, x: 50, y: 45 },
      { name: 'Passengers', value: 1845230, size: 95, x: 18, y: 28 },
      { name: 'Airlines', value: 856420, size: 75, x: 82, y: 20 },
      { name: 'Routes', value: 624580, size: 62, x: 20, y: 80 },
      { name: 'Airports', value: 456890, size: 55, x: 80, y: 75 },
    ],
  };

  // Bottom stats for bubble chart
  const bubbleStats = {
    '1W': { records: 31580, queries: 12450, syncs: 86 },
    '1M': { records: 138070, queries: 54820, syncs: 324 },
    '3M': { records: 423580, queries: 168420, syncs: 892 },
    '1Y': { records: 1735040, queries: 684520, syncs: 3456 },
    'ALL': { records: 6242040, queries: 2458920, syncs: 12840 },
  };

  // Database overview
  const [databases, setDatabases] = useState([
    { name: 'Production DB', type: 'PostgreSQL', size: '186.4 GB', status: 'healthy', latency: '12ms' },
    { name: 'Analytics DB', type: 'ClickHouse', size: '98.2 GB', status: 'healthy', latency: '8ms' },
    { name: 'Cache', type: 'Redis', size: '24.8 GB', status: 'healthy', latency: '1ms' },
    { name: 'Backup', type: 'S3', size: '312.4 GB', status: 'syncing', latency: '-' },
  ]);

  // Recent imports
  const [recentImports, setRecentImports] = useState([
    { name: 'passenger_data_jan.xlsx', size: '2.4 MB', date: '2 hours ago', status: 'completed', records: 12450 },
    { name: 'airline_stats_q4.csv', size: '856 KB', date: '1 day ago', status: 'completed', records: 3420 },
    { name: 'flight_schedules.xlsx', size: '1.8 MB', date: '3 days ago', status: 'completed', records: 8920 },
  ]);

  // Storage usage trend
  const usageTrend = [
    { month: 'Aug', value: 245 },
    { month: 'Sep', value: 268 },
    { month: 'Oct', value: 285 },
    { month: 'Nov', value: 298 },
    { month: 'Dec', value: 312 },
    { month: 'Jan', value: 312.4 },
  ];

  // Data transfer metrics
  const transferMetrics = [
    { type: 'Inbound', value: 24.5, unit: 'GB/day', trend: 'up' },
    { type: 'Outbound', value: 18.2, unit: 'GB/day', trend: 'up' },
    { type: 'API Calls', value: '2.4M', unit: '/day', trend: 'up' },
  ];

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 600));
      setIsLoading(false);
    };
    loadData();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-slate-400 mt-4">Loading data management...</p>
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
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
            </div>
            Data Management
          </h1>
          <p className="text-slate-400 mt-1">Structured data tools for accuracy, clarity, and seamless monitoring.</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl font-medium transition-colors cursor-pointer flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Import Data
            <input type="file" className="hidden" accept=".csv,.xlsx,.xls" onChange={handleFileUpload} />
          </label>
          <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export
          </button>
        </div>
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div className="bg-slate-900/50 rounded-xl p-4 border border-cyan-500/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-medium">Uploading file...</span>
            <span className="text-cyan-400">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm">Total Storage</span>
            <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-white mt-2">{storage.total} GB</p>
          <span className="text-slate-500 text-xs">Allocated capacity</span>
        </div>

        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm">Used Space</span>
            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-white mt-2">{storage.used} GB</p>
          <span className="text-slate-500 text-xs">{((storage.used / storage.total) * 100).toFixed(1)}% utilized</span>
        </div>

        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm">Data Growth</span>
            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-white mt-2">+{storage.growth}%</p>
          <span className="text-green-400 text-xs">This month</span>
        </div>

        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm">Active Queries</span>
            <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-white mt-2">{storage.activeQueries.toLocaleString()}</p>
          <span className="text-slate-500 text-xs">Per minute</span>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Storage Usage Trend */}
        <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Storage Usage Trend</h2>
            <span className="text-xs text-slate-400">Last 6 months</span>
          </div>

          <div className="h-48 relative">
            <svg className="w-full h-full" viewBox="0 0 300 150" preserveAspectRatio="none">
              {/* Area fill */}
              <path
                d={`M0,150 L0,${150 - (usageTrend[0].value / 350) * 140} ${usageTrend.map((d, i) => 
                  `L${(i / (usageTrend.length - 1)) * 300},${150 - (d.value / 350) * 140}`
                ).join(' ')} L300,150 Z`}
                fill="url(#storageGradient)"
                opacity="0.3"
              />
              
              {/* Line */}
              <path
                d={`M0,${150 - (usageTrend[0].value / 350) * 140} ${usageTrend.map((d, i) => 
                  `L${(i / (usageTrend.length - 1)) * 300},${150 - (d.value / 350) * 140}`
                ).join(' ')}`}
                fill="none"
                stroke="#10b981"
                strokeWidth="2"
              />

              <defs>
                <linearGradient id="storageGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div className="flex justify-between mt-2 text-xs text-slate-500">
            {usageTrend.map((d, i) => (
              <span key={i}>{d.month}</span>
            ))}
          </div>
        </div>

        {/* Data Transfer */}
        <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Data Transfer</h2>
            <span className="text-xs text-slate-400">Real-time</span>
          </div>

          <div className="space-y-6">
            {transferMetrics.map((metric, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-sm">{metric.type}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold">{metric.value}</span>
                    <span className="text-slate-500 text-sm">{metric.unit}</span>
                    {metric.trend === 'up' && (
                      <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                    )}
                  </div>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      i === 0 ? 'bg-cyan-500' : i === 1 ? 'bg-blue-500' : 'bg-purple-500'
                    }`}
                    style={{ width: `${70 - i * 15}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bubble Chart - Data Distribution */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 rounded-2xl p-6 border border-slate-800 overflow-hidden">
        {/* Time Range Selector */}
        <div className="flex flex-col items-center mb-6">
          <span className="text-slate-500 text-xs tracking-[0.3em] uppercase mb-4">Time Range</span>
          <div className="flex items-center gap-2 bg-slate-800/50 rounded-xl p-1">
            {['1W', '1M', '3M', '1Y', 'ALL'].map((range) => (
              <button
                key={range}
                onClick={() => setSelectedTimeRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedTimeRange === range
                    ? 'bg-slate-700 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Bubble Chart Container */}
        <div 
          ref={bubbleContainerRef}
          className="relative h-[400px] w-full"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.1) 0%, transparent 50%)',
          }}
        >
          {/* Orbital rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[300px] h-[300px] border border-slate-700/30 rounded-full" />
            <div className="absolute w-[200px] h-[200px] border border-slate-700/20 rounded-full" />
          </div>

          {/* Floating decorative bubbles */}
          <div className="absolute w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 opacity-60 blur-sm" style={{ top: '10%', left: '5%' }} />
          <div className="absolute w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 opacity-40 blur-sm" style={{ top: '75%', left: '8%' }} />
          <div className="absolute w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 opacity-50 blur-sm" style={{ top: '5%', right: '8%' }} />
          <div className="absolute w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 opacity-40 blur-sm" style={{ top: '80%', right: '5%' }} />
          
          {/* Small red accent dots */}
          <div className="absolute w-2 h-2 rounded-full bg-red-500" style={{ top: '25%', left: '18%' }} />
          <div className="absolute w-2 h-2 rounded-full bg-red-500" style={{ top: '60%', left: '12%' }} />
          <div className="absolute w-2 h-2 rounded-full bg-red-500" style={{ top: '35%', right: '15%' }} />

          {/* Main Data Bubbles */}
          {bubbleData[selectedTimeRange].map((bubble, index) => (
            <div
              key={bubble.name}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ease-out cursor-pointer group"
              style={{
                left: `${bubble.x}%`,
                top: `${bubble.y}%`,
                width: `${bubble.size}px`,
                height: `${bubble.size}px`,
              }}
            >
              {/* Bubble glow */}
              <div 
                className="absolute inset-0 rounded-full opacity-50 blur-md transition-opacity group-hover:opacity-70"
                style={{
                  background: 'radial-gradient(circle at 30% 30%, rgba(239, 68, 68, 0.8), rgba(99, 102, 241, 0.6))',
                }}
              />
              
              {/* Bubble body */}
              <div 
                className="absolute inset-0 rounded-full transition-transform group-hover:scale-110"
                style={{
                  background: 'radial-gradient(circle at 35% 35%, rgba(239, 68, 68, 0.9), rgba(147, 51, 234, 0.7) 50%, rgba(79, 70, 229, 0.8))',
                  boxShadow: 'inset -5px -5px 20px rgba(0,0,0,0.3), inset 5px 5px 20px rgba(255,255,255,0.1)',
                }}
              />
              
              {/* Bubble highlight */}
              <div 
                className="absolute rounded-full bg-white/20"
                style={{
                  width: '30%',
                  height: '30%',
                  top: '15%',
                  left: '20%',
                  filter: 'blur(2px)',
                }}
              />
              
              {/* Bubble content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
                <span className="text-white/90 text-xs font-medium leading-tight">{bubble.name}</span>
                <span className="text-white font-bold text-sm mt-0.5">
                  {bubble.value >= 1000000 
                    ? `${(bubble.value / 1000000).toFixed(1)}M`
                    : bubble.value >= 1000 
                    ? `${(bubble.value / 1000).toFixed(0)}K`
                    : bubble.value}
                </span>
                <span className="text-white/60 text-[10px]">records</span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Stats */}
        <div className="grid grid-cols-3 gap-6 mt-6 pt-6 border-t border-slate-800">
          <div className="text-center">
            <div className="w-10 h-10 mx-auto mb-2 rounded-xl border border-slate-700 flex items-center justify-center">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="text-slate-500 text-xs tracking-wider uppercase">Total Records</span>
            <p className="text-white text-2xl font-bold mt-1">
              {bubbleStats[selectedTimeRange].records >= 1000000 
                ? `${(bubbleStats[selectedTimeRange].records / 1000000).toFixed(1)}M`
                : bubbleStats[selectedTimeRange].records.toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 mx-auto mb-2 rounded-xl border border-slate-700 flex items-center justify-center">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-slate-500 text-xs tracking-wider uppercase">Active Queries</span>
            <p className="text-white text-2xl font-bold mt-1">
              {bubbleStats[selectedTimeRange].queries >= 1000000 
                ? `${(bubbleStats[selectedTimeRange].queries / 1000000).toFixed(1)}M`
                : bubbleStats[selectedTimeRange].queries.toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 mx-auto mb-2 rounded-xl border border-slate-700 flex items-center justify-center">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-slate-500 text-xs tracking-wider uppercase">Data Syncs</span>
            <p className="text-white text-2xl font-bold mt-1">
              {bubbleStats[selectedTimeRange].syncs.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Database Overview */}
      <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Data Base Overview</h2>
          <button className="text-cyan-400 text-sm hover:text-cyan-300">Manage →</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-slate-400 border-b border-slate-800">
                <th className="pb-4 font-medium">Database</th>
                <th className="pb-4 font-medium">Type</th>
                <th className="pb-4 font-medium">Size</th>
                <th className="pb-4 font-medium">Status</th>
                <th className="pb-4 font-medium">Latency</th>
                <th className="pb-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {databases.map((db, i) => (
                <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        db.type === 'PostgreSQL' ? 'bg-blue-500/20' :
                        db.type === 'ClickHouse' ? 'bg-yellow-500/20' :
                        db.type === 'Redis' ? 'bg-red-500/20' :
                        'bg-green-500/20'
                      }`}>
                        <svg className={`w-5 h-5 ${
                          db.type === 'PostgreSQL' ? 'text-blue-400' :
                          db.type === 'ClickHouse' ? 'text-yellow-400' :
                          db.type === 'Redis' ? 'text-red-400' :
                          'text-green-400'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                        </svg>
                      </div>
                      <span className="text-white font-medium">{db.name}</span>
                    </div>
                  </td>
                  <td className="py-4 text-slate-400">{db.type}</td>
                  <td className="py-4 text-slate-300">{db.size}</td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      db.status === 'healthy' ? 'bg-green-500/20 text-green-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {db.status}
                    </span>
                  </td>
                  <td className="py-4 text-slate-400">{db.latency}</td>
                  <td className="py-4">
                    <button className="text-cyan-400 hover:text-cyan-300 text-sm">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Imports */}
      <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Recent Imports</h2>
          <button className="text-cyan-400 text-sm hover:text-cyan-300">View All</button>
        </div>

        <div className="space-y-3">
          {recentImports.map((file, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl hover:bg-slate-800/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-medium">{file.name}</p>
                  <p className="text-slate-500 text-sm">{file.size} • {file.records.toLocaleString()} records</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  file.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {file.status}
                </span>
                <p className="text-slate-500 text-xs mt-1">{file.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Data;
