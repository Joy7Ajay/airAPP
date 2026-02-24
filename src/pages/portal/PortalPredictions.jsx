import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api';

const getLastValue = (series) => {
  if (!Array.isArray(series) || series.length === 0) return 0;
  const last = series[series.length - 1];
  return Number(last.value || last.predicted || last.passengers || 0);
};

const PortalPredictions = () => {
  const { token } = useOutletContext();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_URL}/dashboard/predictions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const payload = await res.json();
        if (!res.ok) throw new Error(payload.message || 'Unable to load predictions');
        setData(payload);
      } catch (err) {
        setError(err.message || 'Unable to load predictions');
      }
    };

    fetchData();
  }, [token]);

  const scenarios = useMemo(() => {
    const scenarioData = data?.scenarioData || {};
    return [
      { name: 'Optimistic', value: getLastValue(scenarioData.optimistic), color: 'text-emerald-300' },
      { name: 'Baseline', value: getLastValue(scenarioData.baseline), color: 'text-cyan-300' },
      { name: 'Conservative', value: getLastValue(scenarioData.conservative), color: 'text-amber-300' },
    ];
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
        <p className="text-xs uppercase tracking-wider text-cyan-400">Forecast Engine</p>
        <h2 className="text-2xl font-semibold mt-1">Predictions</h2>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4">
            <p className="text-slate-400 text-sm">Next Month</p>
            <p className="text-xl font-semibold mt-1">{data.stats?.nextMonth || '$0k'}</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4">
            <p className="text-slate-400 text-sm">Passengers</p>
            <p className="text-xl font-semibold mt-1">{data.stats?.passengers || '0'}</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4">
            <p className="text-slate-400 text-sm">Growth</p>
            <p className="text-xl font-semibold mt-1 text-cyan-400">{data.stats?.growth || '0%'}</p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-lg font-semibold">Scenario Projection</h3>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {scenarios.map((scenario) => (
              <div key={scenario.name} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                <p className="text-xs uppercase tracking-wider text-slate-400">{scenario.name}</p>
                <p className={`text-xl font-semibold mt-2 ${scenario.color}`}>{scenario.value.toLocaleString()}</p>
              </div>
            ))}
          </div>

          <h4 className="text-sm text-slate-400 mt-6 mb-2">Forecast Timeline</h4>
          <div className="space-y-2 max-h-64 overflow-auto pr-1">
            {(data.forecastTimeline || []).length === 0 ? (
              <p className="text-slate-500 text-sm">No forecast timeline available.</p>
            ) : (
              data.forecastTimeline.slice(0, 10).map((point, idx) => (
                <div key={`timeline-${idx}`} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/40">
                  <span className="text-sm text-slate-300">{point.month || point.date || `Point ${idx + 1}`}</span>
                  <span className="text-sm text-cyan-300 font-medium">{(point.predicted || point.value || 0).toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-lg font-semibold">AI Recommendations</h3>
          <div className="mt-4 space-y-3">
            {(data.aiInsights || []).length === 0 ? (
              <p className="text-slate-500 text-sm">No recommendations available.</p>
            ) : (
              data.aiInsights.slice(0, 6).map((insight, idx) => (
                <div key={`insight-${idx}`} className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <p className="text-sm font-medium text-slate-200">{insight.title || `Insight ${idx + 1}`}</p>
                  <p className="text-xs text-slate-400 mt-1">{insight.description || insight.detail || 'Model recommendation available in source data.'}</p>
                  {insight.confidence != null && (
                    <p className="text-xs text-cyan-300 mt-2">Confidence: {insight.confidence}%</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default PortalPredictions;
