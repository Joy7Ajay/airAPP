import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api';

const PortalAIInsights = () => {
  const { token } = useOutletContext();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_URL}/dashboard/ai-insights`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const payload = await res.json();
        if (!res.ok) throw new Error(payload.message || 'Unable to load AI insights');
        setData(payload);
      } catch (err) {
        setError(err.message || 'Unable to load AI insights');
      }
    };

    fetchData();
  }, [token]);

  const avgAccuracy = useMemo(() => {
    const models = data?.models || [];
    if (!models.length) return 0;
    const sum = models.reduce((acc, model) => acc + Number(model.accuracy || 0), 0);
    return (sum / models.length).toFixed(1);
  }, [data]);

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

  return (
    <div className="space-y-6">
      <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 sm:p-6">
        <p className="text-xs uppercase tracking-wider text-cyan-400">Model Intelligence</p>
        <h2 className="text-2xl font-semibold mt-1">AI Insights</h2>
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4">
            <p className="text-slate-400 text-sm">Active Models</p>
            <p className="text-2xl font-semibold mt-1">{data.models?.length || 0}</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4">
            <p className="text-slate-400 text-sm">Average Accuracy</p>
            <p className="text-2xl font-semibold mt-1 text-cyan-400">{avgAccuracy}%</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4">
            <p className="text-slate-400 text-sm">Inference Streams</p>
            <p className="text-2xl font-semibold mt-1">{data.inferenceData?.length || 0}</p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-lg font-semibold">Model Performance</h3>
          <div className="mt-4 space-y-3">
            {(data.models || []).length === 0 ? (
              <p className="text-slate-500 text-sm">No model data available.</p>
            ) : (
              data.models.map((model, idx) => (
                <div key={`${model.name || 'model'}-${idx}`} className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-200">{model.name || `Model ${idx + 1}`}</p>
                    <span className="text-xs px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-300">{model.status || 'active'}</span>
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Accuracy</span>
                      <span>{model.accuracy || 0}%</span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-slate-700">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                        style={{ width: `${Math.min(100, Number(model.accuracy || 0))}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-lg font-semibold">Metrics Table</h3>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800">
                  <th className="text-left pb-2">Metric</th>
                  <th className="text-left pb-2">Value</th>
                </tr>
              </thead>
              <tbody>
                {(data.performanceMetrics || []).length === 0 ? (
                  <tr>
                    <td className="py-3 text-slate-500" colSpan={2}>No metrics available.</td>
                  </tr>
                ) : (
                  data.performanceMetrics.slice(0, 8).map((metric, idx) => (
                    <tr key={`metric-${idx}`} className="border-b border-slate-800/60">
                      <td className="py-2 text-slate-300">{metric.model || metric.name || `Metric ${idx + 1}`}</td>
                      <td className="py-2 text-cyan-300">{metric.accuracy || metric.value || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PortalAIInsights;
