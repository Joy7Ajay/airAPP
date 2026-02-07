import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';

const Analytics = () => {
  const { user, token } = useOutletContext();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('yearly');
  const [selectedMetric, setSelectedMetric] = useState('passengers');

  // Mock data
  const [stats, setStats] = useState({
    pageViews: '2.4M',
    uniqueVisitors: '38,542',
    avgSession: '4m 32s',
    bounceRate: '3.8',
  });

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 600));
      setIsLoading(false);
    };
    loadData();
  }, []);

  // Monthly trend data
  const monthlyTrend = [
    { month: 'Jan', value: 65 },
    { month: 'Feb', value: 72 },
    { month: 'Mar', value: 85 },
    { month: 'Apr', value: 78 },
    { month: 'May', value: 92 },
    { month: 'Jun', value: 98 },
    { month: 'Jul', value: 105 },
    { month: 'Aug', value: 95 },
    { month: 'Sep', value: 88 },
    { month: 'Oct', value: 82 },
    { month: 'Nov', value: 90 },
    { month: 'Dec', value: 110 },
  ];

  // Engagement metrics
  const engagementMetrics = [
    { label: 'Direct Traffic', value: 45, color: 'cyan' },
    { label: 'Referral', value: 25, color: 'blue' },
    { label: 'Organic Search', value: 20, color: 'purple' },
    { label: 'Social Media', value: 10, color: 'pink' },
  ];

  // Hourly analytics
  const hourlyData = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    value: Math.floor(Math.random() * 100) + 20,
  }));

  // Country breakdown
  const countryData = [
    { country: 'Kenya', code: 'KE', passengers: 45230, percentage: 28 },
    { country: 'UAE', code: 'AE', passengers: 38450, percentage: 24 },
    { country: 'Ethiopia', code: 'ET', passengers: 32100, percentage: 20 },
    { country: 'South Africa', code: 'ZA', passengers: 28900, percentage: 18 },
    { country: 'United Kingdom', code: 'GB', passengers: 16320, percentage: 10 },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-slate-400 mt-4">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-slate-400 mt-1">Advanced analytics designed to transform complex datasets into clear insights.</p>
        </div>
        <div className="flex items-center gap-2">
          {['daily', 'weekly', 'monthly', 'yearly'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedPeriod === period
                  ? 'bg-cyan-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm">Page Views</span>
            <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-white mt-2">{stats.pageViews}</p>
          <span className="text-green-400 text-xs">+12.5% from last period</span>
        </div>

        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm">Unique Visitors</span>
            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-white mt-2">{stats.uniqueVisitors}</p>
          <span className="text-green-400 text-xs">+24.5% from last period</span>
        </div>

        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm">Avg. Session</span>
            <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-white mt-2">{stats.avgSession}</p>
          <span className="text-green-400 text-xs">+8.2% from last period</span>
        </div>

        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm">Bounce Rate</span>
            <svg className="w-4 h-4 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-white mt-2">{stats.bounceRate}%</p>
          <span className="text-red-400 text-xs">-2.1% from last period</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Multi-Metric Performance */}
        <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Multi-Metric Performance</h2>
            <select className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/50">
              <option>Last 12 months</option>
              <option>Last 6 months</option>
              <option>Last 3 months</option>
            </select>
          </div>

          {/* Area Chart Visualization */}
          <div className="h-48 relative">
            <svg className="w-full h-full" viewBox="0 0 400 150" preserveAspectRatio="none">
              {/* Grid lines */}
              {[0, 1, 2, 3, 4].map((i) => (
                <line key={i} x1="0" y1={i * 37.5} x2="400" y2={i * 37.5} stroke="#334155" strokeWidth="0.5" />
              ))}
              
              {/* Area */}
              <path
                d={`M0,150 L0,${150 - monthlyTrend[0].value} ${monthlyTrend.map((d, i) => 
                  `L${(i / (monthlyTrend.length - 1)) * 400},${150 - d.value}`
                ).join(' ')} L400,150 Z`}
                fill="url(#areaGradient)"
                opacity="0.3"
              />
              
              {/* Line */}
              <path
                d={`M0,${150 - monthlyTrend[0].value} ${monthlyTrend.map((d, i) => 
                  `L${(i / (monthlyTrend.length - 1)) * 400},${150 - d.value}`
                ).join(' ')}`}
                fill="none"
                stroke="#06b6d4"
                strokeWidth="2"
              />

              {/* Dots */}
              {monthlyTrend.map((d, i) => (
                <circle
                  key={i}
                  cx={(i / (monthlyTrend.length - 1)) * 400}
                  cy={150 - d.value}
                  r="4"
                  fill="#06b6d4"
                  className="cursor-pointer hover:r-6"
                />
              ))}

              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* X-axis labels */}
          <div className="flex justify-between mt-2 text-xs text-slate-500">
            {monthlyTrend.map((d, i) => (
              <span key={i}>{d.month}</span>
            ))}
          </div>
        </div>

        {/* Engagement Metrics */}
        <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Engagement Metrics</h2>
            <span className="text-xs text-slate-400">Traffic sources</span>
          </div>

          {/* Radar/Pentagon Chart Placeholder */}
          <div className="flex items-center justify-center h-48">
            <div className="relative w-40 h-40">
              {/* Pentagon shape */}
              <svg className="w-full h-full" viewBox="0 0 100 100">
                {/* Background rings */}
                {[1, 0.75, 0.5, 0.25].map((scale, i) => (
                  <polygon
                    key={i}
                    points="50,10 90,35 80,80 20,80 10,35"
                    fill="none"
                    stroke="#334155"
                    strokeWidth="0.5"
                    transform={`scale(${scale}) translate(${(1-scale)*50} ${(1-scale)*50})`}
                  />
                ))}
                {/* Data polygon */}
                <polygon
                  points="50,20 75,40 65,70 35,70 25,40"
                  fill="rgba(6, 182, 212, 0.2)"
                  stroke="#06b6d4"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            {engagementMetrics.map((metric, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full bg-${metric.color}-500`} 
                     style={{ backgroundColor: metric.color === 'cyan' ? '#06b6d4' : 
                              metric.color === 'blue' ? '#3b82f6' : 
                              metric.color === 'purple' ? '#8b5cf6' : '#ec4899' }} />
                <span className="text-sm text-slate-400">{metric.label}</span>
                <span className="text-sm text-white font-medium ml-auto">{metric.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hourly Analytics */}
      <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Hourly Analytics</h2>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 bg-cyan-500 text-white rounded-lg text-sm">Today</button>
            <button className="px-3 py-1.5 bg-slate-800 text-slate-400 rounded-lg text-sm">Yesterday</button>
          </div>
        </div>

        {/* Heatmap-style hourly data */}
        <div className="grid grid-cols-24 gap-1">
          {hourlyData.map((data, i) => (
            <div
              key={i}
              className="aspect-square rounded-sm cursor-pointer transition-transform hover:scale-110"
              style={{
                backgroundColor: `rgba(6, 182, 212, ${data.value / 120})`,
              }}
              title={`${i}:00 - ${data.value} visitors`}
            />
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-slate-500">
          <span>12 AM</span>
          <span>6 AM</span>
          <span>12 PM</span>
          <span>6 PM</span>
          <span>11 PM</span>
        </div>
      </div>

      {/* Country Breakdown */}
      <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Traffic by Country</h2>
          <span className="text-xs text-slate-400">Top destinations</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-slate-400">
                <th className="pb-4 font-medium">Country</th>
                <th className="pb-4 font-medium">Passengers</th>
                <th className="pb-4 font-medium">Share</th>
                <th className="pb-4 font-medium">Trend</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {countryData.map((country, i) => (
                <tr key={i} className="border-t border-slate-800">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-xs font-bold text-slate-400">
                        {country.code}
                      </div>
                      <span className="text-white font-medium">{country.country}</span>
                    </div>
                  </td>
                  <td className="py-4 text-slate-300">{country.passengers.toLocaleString()}</td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-slate-800 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                          style={{ width: `${country.percentage}%` }}
                        />
                      </div>
                      <span className="text-slate-400">{country.percentage}%</span>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className="text-green-400 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                      +{Math.floor(Math.random() * 15) + 1}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
