import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api';

const PortalAnalytics = () => {
  const { token } = useOutletContext();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_URL}/dashboard/analytics`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const payload = await res.json();
        if (!res.ok) throw new Error(payload.message || 'Unable to load analytics');
        setData(payload);
      } catch (err) {
        setError(err.message || 'Unable to load analytics');
      }
    };

    fetchData();
  }, [token]);

  const trendBars = useMemo(() => {
    const trend = data?.monthlyTrend || [];
    const maxValue = Math.max(...trend.map((item) => item.value), 1);
    return trend.slice(-10).map((item) => ({
      month: item.month,
      value: item.value,
      height: Math.max(12, Math.round((item.value / maxValue) * 140)),
    }));
  }, [data]);

  if (error) {
    return <p className="text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl p-4">{error}</p>;
  }

  if (!data) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-28 bg-slate-900/60 border border-slate-800 rounded-2xl" />
        <div className="h-72 bg-slate-900/60 border border-slate-800 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-cyan-400">Performance</p>
            <h2 className="text-2xl font-semibold mt-1">Analytics</h2>
          </div>
          <span className="text-xs text-slate-400 border border-slate-700 rounded-full px-3 py-1">Range: {data.range || 'default'}</span>
        </div>

        <div className="mt-5 grid grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4">
            <p className="text-slate-400 text-sm">Page Views</p>
            <p className="text-xl font-semibold mt-1">{data.stats?.pageViews || '0'}</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4">
            <p className="text-slate-400 text-sm">Unique Visitors</p>
            <p className="text-xl font-semibold mt-1">{data.stats?.uniqueVisitors || '0'}</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4">
            <p className="text-slate-400 text-sm">Avg Session</p>
            <p className="text-xl font-semibold mt-1">{data.stats?.avgSession || '0m'}</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4">
            <p className="text-slate-400 text-sm">Bounce Rate</p>
            <p className="text-xl font-semibold mt-1">{data.stats?.bounceRate || '0%'}</p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-lg font-semibold">Monthly Trend</h3>
          <div className="mt-5 h-44 flex items-end gap-2">
            {trendBars.length === 0 ? (
              <p className="text-slate-500 text-sm">No trend data.</p>
            ) : (
              trendBars.map((bar) => (
                <div key={`${bar.month}-${bar.value}`} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-cyan-500/80 to-blue-400/80"
                    style={{ height: `${bar.height}px` }}
                    title={`${bar.month}: ${bar.value}`}
                  />
                  <span className="text-[11px] text-slate-400">{bar.month}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-lg font-semibold">Engagement Metrics</h3>
          <div className="mt-4 space-y-3">
            {(data.engagementMetrics || []).length === 0 ? (
              <p className="text-slate-500 text-sm">No metrics available.</p>
            ) : (
              data.engagementMetrics.map((metric, idx) => (
                <div key={`${metric.label}-${idx}`}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">{metric.label}</span>
                    <span className="text-cyan-300 font-medium">{metric.value}%</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-slate-800">
                    <div className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500" style={{ width: `${Math.min(100, metric.value)}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default PortalAnalytics;
