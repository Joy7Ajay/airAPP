import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api';

const PortalData = () => {
  const { token } = useOutletContext();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_URL}/dashboard/data`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const payload = await res.json();
        if (!res.ok) throw new Error(payload.message || 'Unable to load data');
        setData(payload);
      } catch (err) {
        setError(err.message || 'Unable to load data');
      }
    };

    fetchData();
  }, [token]);

  if (error) {
    return <p className="text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl p-4">{error}</p>;
  }

  if (!data) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-28 bg-slate-900/60 border border-slate-800 rounded-2xl" />
        <div className="h-64 bg-slate-900/60 border border-slate-800 rounded-2xl" />
      </div>
    );
  }

  const storage = data.storage || {};
  const used = Number(storage.used || 0);
  const total = Number(storage.total || 0);
  const usagePct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;

  return (
    <div className="space-y-6">
      <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 sm:p-6">
        <p className="text-xs uppercase tracking-wider text-cyan-400">Data Operations</p>
        <h2 className="text-2xl font-semibold mt-1">Data</h2>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4">
            <p className="text-slate-400 text-sm">Storage Used</p>
            <p className="text-xl font-semibold mt-1">{used.toFixed(2)} GB</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4">
            <p className="text-slate-400 text-sm">Storage Total</p>
            <p className="text-xl font-semibold mt-1">{total.toFixed(2)} GB</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4">
            <p className="text-slate-400 text-sm">Active Queries</p>
            <p className="text-xl font-semibold mt-1">{storage.activeQueries || 0}</p>
          </div>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Storage Utilization</span>
            <span>{usagePct}%</span>
          </div>
          <div className="mt-1 h-2 rounded-full bg-slate-800">
            <div className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500" style={{ width: `${usagePct}%` }} />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-lg font-semibold">Databases</h3>
          <div className="mt-4 space-y-3">
            {(data.databases || []).length === 0 ? (
              <p className="text-slate-500 text-sm">No databases listed.</p>
            ) : (
              data.databases.map((database, idx) => (
                <div key={`${database.name}-${idx}`} className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-200">{database.name}</p>
                    <span className="text-xs px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-300">{database.status || 'healthy'}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">{database.type} • {database.size}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-lg font-semibold">Recent Imports</h3>
          <div className="mt-4 space-y-3">
            {(data.recentImports || []).length === 0 ? (
              <p className="text-slate-500 text-sm">No import activity available.</p>
            ) : (
              data.recentImports.map((item, idx) => (
                <div key={`${item.name}-${idx}`} className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <p className="text-sm font-medium text-slate-200">{item.name}</p>
                  <p className="text-xs text-slate-400 mt-1">{item.size} • {item.date}</p>
                </div>
              ))
            )}
          </div>

          <h4 className="text-sm text-slate-400 mt-6 mb-2">Transfer Metrics</h4>
          <div className="flex flex-wrap gap-2">
            {(data.transferMetrics || []).length === 0 ? (
              <span className="text-xs text-slate-500">No transfer metrics.</span>
            ) : (
              data.transferMetrics.map((metric, idx) => (
                <span key={`${metric.type}-${idx}`} className="px-3 py-1 rounded-full border border-slate-700 bg-slate-800/60 text-xs text-slate-300">
                  {metric.type}: {metric.value} {metric.unit || ''}
                </span>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default PortalData;
