import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api';

const formatNumber = (value) => Number(value || 0).toLocaleString();

const PortalOverview = () => {
  const { token } = useOutletContext();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_URL}/dashboard/overview`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const payload = await res.json();
        if (!res.ok) throw new Error(payload.message || 'Unable to load overview');
        setData(payload);
      } catch (err) {
        setError(err.message || 'Unable to load overview');
      }
    };

    fetchData();
  }, [token]);

  const monthlyBars = useMemo(() => {
    const series = data?.monthlyData || [];
    const maxValue = Math.max(...series.map((item) => item.arrivals + item.departures), 1);
    return series.slice(-8).map((item) => ({
      month: item.month,
      total: item.arrivals + item.departures,
      height: Math.max(12, Math.round(((item.arrivals + item.departures) / maxValue) * 120)),
    }));
  }, [data]);

  if (error) {
    return <p className="text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl p-4">{error}</p>;
  }

  if (!data) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-36 bg-slate-900/60 border border-slate-800 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-24 bg-slate-900/60 border border-slate-800 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800 rounded-2xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-cyan-400">Operations Snapshot</p>
            <h2 className="text-2xl font-semibold mt-1">Overview</h2>
            <p className="text-slate-400 text-sm mt-2">Real-time activity summary across arrivals and departures.</p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xs text-slate-500">Growth Rate</p>
            <p className="text-2xl font-bold text-cyan-400">{data.stats?.growthRate || 0}%</p>
          </div>
        </div>

        <div className="mt-6 flex items-end gap-2 h-32">
          {monthlyBars.length === 0 ? (
            <p className="text-slate-500 text-sm">No monthly trend data.</p>
          ) : (
            monthlyBars.map((point) => (
              <div key={point.month} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-cyan-500/80 to-blue-400/80"
                  style={{ height: `${point.height}px` }}
                  title={`${point.month}: ${formatNumber(point.total)}`}
                />
                <span className="text-[11px] text-slate-400">{point.month}</span>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-sm">Arrivals</p>
          <p className="text-2xl font-semibold mt-1">{formatNumber(data.stats?.totalArrivals)}</p>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-sm">Departures</p>
          <p className="text-2xl font-semibold mt-1">{formatNumber(data.stats?.totalDepartures)}</p>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-sm">Active Airlines</p>
          <p className="text-2xl font-semibold mt-1">{formatNumber(data.stats?.activeAirlines)}</p>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-sm">Recent Activities</p>
          <p className="text-2xl font-semibold mt-1">{formatNumber((data.recentActivity || []).length)}</p>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
          <h3 className="text-lg font-semibold">Recent System Activity</h3>
          <div className="mt-4 space-y-3">
            {(data.recentActivity || []).length === 0 ? (
              <p className="text-slate-500 text-sm">No recent records available.</p>
            ) : (
              data.recentActivity.slice(0, 5).map((activity, idx) => (
                <div key={`${activity.flight}-${idx}`} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <div>
                    <p className="text-sm font-medium text-slate-200">{activity.flight || 'Activity'}</p>
                    <p className="text-xs text-slate-500 mt-1">{activity.status || 'logged'}</p>
                  </div>
                  <span className="text-xs text-slate-400">{activity.time ? new Date(activity.time).toLocaleString() : '-'}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
          <h3 className="text-lg font-semibold">Top Destinations</h3>
          <div className="mt-4 space-y-3">
            {(data.topDestinations || []).length === 0 ? (
              <p className="text-slate-500 text-sm">No destination ranking available yet.</p>
            ) : (
              data.topDestinations.slice(0, 5).map((destination, idx) => (
                <div key={`${destination.name}-${idx}`} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-md bg-cyan-500/20 text-cyan-300 text-xs flex items-center justify-center font-semibold">{idx + 1}</span>
                    <p className="text-sm font-medium text-slate-200">{destination.name || 'Destination'}</p>
                  </div>
                  <p className="text-sm text-slate-300">{formatNumber(destination.value || destination.passengers || 0)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default PortalOverview;
