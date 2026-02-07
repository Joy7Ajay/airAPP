import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';

const Overview = () => {
  const { user, token } = useOutletContext();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalArrivals: 0,
    totalDepartures: 0,
    growthRate: 0,
    activeAirlines: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [topAirlines, setTopAirlines] = useState([]);
  const [topDestinations, setTopDestinations] = useState([]);

  // Simulated data - in production, this would come from API
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock data for Uganda air travel
      setStats({
        totalArrivals: 124592,
        totalDepartures: 118456,
        growthRate: 12.8,
        activeAirlines: 24,
      });

      setTopAirlines([
        { name: 'Uganda Airlines', flights: 2450, percentage: 28 },
        { name: 'Ethiopian Airlines', flights: 1890, percentage: 22 },
        { name: 'Kenya Airways', flights: 1560, percentage: 18 },
        { name: 'Emirates', flights: 1230, percentage: 14 },
        { name: 'Qatar Airways', flights: 980, percentage: 11 },
        { name: 'Turkish Airlines', flights: 620, percentage: 7 },
      ]);

      setTopDestinations([
        { country: 'Kenya', city: 'Nairobi', passengers: 45230, trend: 'up' },
        { country: 'UAE', city: 'Dubai', passengers: 38450, trend: 'up' },
        { country: 'Ethiopia', city: 'Addis Ababa', passengers: 32100, trend: 'stable' },
        { country: 'South Africa', city: 'Johannesburg', passengers: 28900, trend: 'up' },
        { country: 'UK', city: 'London', passengers: 24500, trend: 'down' },
      ]);

      setRecentActivity([
        { type: 'arrival', flight: 'UR801', airline: 'Uganda Airlines', from: 'Dubai', time: '10 min ago', status: 'landed' },
        { type: 'departure', flight: 'ET302', airline: 'Ethiopian Airlines', to: 'Addis Ababa', time: '25 min ago', status: 'departed' },
        { type: 'arrival', flight: 'KQ456', airline: 'Kenya Airways', from: 'Nairobi', time: '45 min ago', status: 'landed' },
        { type: 'departure', flight: 'UR802', airline: 'Uganda Airlines', to: 'Johannesburg', time: '1 hr ago', status: 'departed' },
        { type: 'arrival', flight: 'EK723', airline: 'Emirates', from: 'Dubai', time: '2 hrs ago', status: 'landed' },
      ]);

      setIsLoading(false);
    };

    loadData();
  }, []);

  // Monthly data for chart
  const monthlyData = [
    { month: 'Jan', arrivals: 8500, departures: 8200 },
    { month: 'Feb', arrivals: 9200, departures: 8900 },
    { month: 'Mar', arrivals: 10500, departures: 10100 },
    { month: 'Apr', arrivals: 9800, departures: 9500 },
    { month: 'May', arrivals: 11200, departures: 10800 },
    { month: 'Jun', arrivals: 12500, departures: 12100 },
    { month: 'Jul', arrivals: 13800, departures: 13200 },
    { month: 'Aug', arrivals: 12900, departures: 12500 },
    { month: 'Sep', arrivals: 11500, departures: 11200 },
    { month: 'Oct', arrivals: 10800, departures: 10500 },
    { month: 'Nov', arrivals: 11900, departures: 11500 },
    { month: 'Dec', arrivals: 14200, departures: 13700 },
  ];

  const maxValue = Math.max(...monthlyData.flatMap(d => [d.arrivals, d.departures]));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-slate-400 mt-4">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Overview</h1>
          <p className="text-slate-400 mt-1">Welcome back! Here's what's happening with Uganda air travel.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span>Last updated:</span>
          <span className="text-cyan-400">{new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Arrivals */}
        <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800 hover:border-cyan-500/30 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
            <span className="text-xs text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded-full">Arrivals</span>
          </div>
          <p className="text-3xl font-bold text-white">{stats.totalArrivals.toLocaleString()}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-green-400 text-sm flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              +8.2%
            </span>
            <span className="text-slate-500 text-sm">vs last month</span>
          </div>
        </div>

        {/* Total Departures */}
        <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800 hover:border-blue-500/30 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </div>
            <span className="text-xs text-blue-400 bg-blue-400/10 px-2 py-1 rounded-full">Departures</span>
          </div>
          <p className="text-3xl font-bold text-white">{stats.totalDepartures.toLocaleString()}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-green-400 text-sm flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              +5.4%
            </span>
            <span className="text-slate-500 text-sm">vs last month</span>
          </div>
        </div>

        {/* Growth Rate */}
        <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800 hover:border-green-500/30 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-full">Growth</span>
          </div>
          <p className="text-3xl font-bold text-white">{stats.growthRate}%</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-green-400 text-sm flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              +2.1%
            </span>
            <span className="text-slate-500 text-sm">vs last year</span>
          </div>
        </div>

        {/* Active Airlines */}
        <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800 hover:border-purple-500/30 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            <span className="text-xs text-purple-400 bg-purple-400/10 px-2 py-1 rounded-full">Airlines</span>
          </div>
          <p className="text-3xl font-bold text-white">{stats.activeAirlines}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-green-400 text-sm flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              +3
            </span>
            <span className="text-slate-500 text-sm">new this quarter</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Passenger Flow Chart */}
        <div className="lg:col-span-2 bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Passenger Flow
              </h2>
              <p className="text-slate-400 text-sm mt-1">Year-over-year performance metrics</p>
            </div>
            <select className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/50">
              <option>Yearly 2025</option>
              <option>Yearly 2024</option>
              <option>Yearly 2023</option>
            </select>
          </div>

          {/* Chart */}
          <div className="h-64 flex items-end gap-2">
            {monthlyData.map((data, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex gap-1 items-end" style={{ height: '200px' }}>
                  <div 
                    className="flex-1 bg-cyan-500/80 rounded-t-sm hover:bg-cyan-400 transition-colors cursor-pointer"
                    style={{ height: `${(data.arrivals / maxValue) * 100}%` }}
                    title={`Arrivals: ${data.arrivals.toLocaleString()}`}
                  />
                  <div 
                    className="flex-1 bg-blue-500/60 rounded-t-sm hover:bg-blue-400 transition-colors cursor-pointer"
                    style={{ height: `${(data.departures / maxValue) * 100}%` }}
                    title={`Departures: ${data.departures.toLocaleString()}`}
                  />
                </div>
                <span className="text-xs text-slate-500">{data.month}</span>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-cyan-500 rounded-sm"></div>
              <span className="text-sm text-slate-400">Arrivals</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
              <span className="text-sm text-slate-400">Departures</span>
            </div>
          </div>
        </div>

        {/* AI Revenue Forecast */}
        <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              AI Forecast
            </h2>
            <span className="text-xs text-slate-400">Q1 2026 Projection</span>
          </div>

          <div className="text-center py-4">
            <p className="text-4xl font-bold text-white">145,600</p>
            <p className="text-slate-400 text-sm mt-1">Predicted Passengers</p>
          </div>

          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="text-green-400 flex items-center gap-1 text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              +16.8%
            </span>
            <span className="text-slate-500 text-sm">growth expected</span>
          </div>

          {/* Confidence Score */}
          <div className="bg-slate-800/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Confidence Score</span>
              <span className="text-cyan-400 font-semibold">96.2%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full" style={{ width: '96.2%' }}></div>
            </div>
          </div>

          <div className="mt-4 space-y-2 text-sm">
            <p className="text-slate-400">Contributing Factors:</p>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Market growth</span>
              <span className="text-slate-300">High</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">User retention</span>
              <span className="text-slate-300">Medium</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Seasonal trends</span>
              <span className="text-slate-300">High</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Airlines */}
        <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Top Airlines
            </h2>
            <span className="text-xs text-slate-400">By total flights</span>
          </div>

          <div className="space-y-4">
            {topAirlines.map((airline, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 text-sm w-4">{index + 1}.</span>
                    <span className="text-white font-medium">{airline.name}</span>
                  </div>
                  <span className="text-slate-400 text-sm">{airline.flights.toLocaleString()} flights</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                    style={{ width: `${airline.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Stream */}
        <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Activity Stream
            </h2>
            <span className="text-xs text-slate-400">Real-time events</span>
          </div>

          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center gap-4 p-3 bg-slate-800/30 rounded-xl hover:bg-slate-800/50 transition-colors">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  activity.type === 'arrival' ? 'bg-green-500/20' : 'bg-blue-500/20'
                }`}>
                  {activity.type === 'arrival' ? (
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{activity.flight}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400 text-sm truncate">{activity.airline}</span>
                  </div>
                  <p className="text-slate-500 text-sm">
                    {activity.type === 'arrival' ? `From ${activity.from}` : `To ${activity.to}`}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    activity.status === 'landed' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {activity.status}
                  </span>
                  <p className="text-slate-500 text-xs mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
