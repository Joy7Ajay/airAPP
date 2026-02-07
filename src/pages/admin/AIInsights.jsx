import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';

const AIInsights = () => {
  const { user, token } = useOutletContext();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState('all');

  // AI Model data
  const [models, setModels] = useState([
    { 
      id: 1, 
      name: 'Revenue Predictor', 
      status: 'active', 
      accuracy: 94.2, 
      lastTrained: '2 days ago',
      predictions: 12450,
      version: 'v3.2'
    },
    { 
      id: 2, 
      name: 'User Flow Analyzer', 
      status: 'active', 
      accuracy: 91.8, 
      lastTrained: '5 days ago',
      predictions: 8920,
      version: 'v2.1'
    },
    { 
      id: 3, 
      name: 'Anomaly Detector', 
      status: 'training', 
      accuracy: 89.5, 
      lastTrained: '1 week ago',
      predictions: 5430,
      version: 'v1.8'
    },
    { 
      id: 4, 
      name: 'Demand Forecaster', 
      status: 'active', 
      accuracy: 96.1, 
      lastTrained: '3 days ago',
      predictions: 15680,
      version: 'v4.0'
    },
  ]);

  // Accuracy trends
  const accuracyTrends = [
    { week: 'W1', value: 88 },
    { week: 'W2', value: 89 },
    { week: 'W3', value: 91 },
    { week: 'W4', value: 90 },
    { week: 'W5', value: 93 },
    { week: 'W6', value: 92 },
    { week: 'W7', value: 94 },
    { week: 'W8', value: 95 },
  ];

  // Inference requests
  const inferenceData = [
    { hour: '00:00', requests: 450 },
    { hour: '04:00', requests: 280 },
    { hour: '08:00', requests: 890 },
    { hour: '12:00', requests: 1200 },
    { hour: '16:00', requests: 980 },
    { hour: '20:00', requests: 750 },
  ];

  // Model performance details
  const performanceMetrics = [
    { model: 'Revenue Predictor', accuracy: 94.2, precision: 93.1, recall: 95.1, f1Score: 94.1 },
    { model: 'User Flow Analyzer', accuracy: 91.8, precision: 90.5, recall: 92.8, f1Score: 91.6 },
    { model: 'Anomaly Detector', accuracy: 89.5, precision: 88.2, recall: 90.4, f1Score: 89.3 },
    { model: 'Demand Forecaster', accuracy: 96.1, precision: 95.8, recall: 96.3, f1Score: 96.0 },
  ];

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 600));
      setIsLoading(false);
    };
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-slate-400 mt-4">Loading AI insights...</p>
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
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            AI-Powered Insights
          </h1>
          <p className="text-slate-400 mt-1">Analyze patterns, monitor performance, and support predictive decision-making.</p>
        </div>
        <button className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl font-medium transition-colors flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Retrain Models
        </button>
      </div>

      {/* Model Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {models.map((model) => (
          <div 
            key={model.id} 
            className={`bg-slate-900/50 rounded-xl p-4 border transition-all cursor-pointer hover:border-cyan-500/50 ${
              model.status === 'training' ? 'border-yellow-500/30' : 'border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs px-2 py-1 rounded-full ${
                model.status === 'active' 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-yellow-500/20 text-yellow-400'
              }`}>
                {model.status}
              </span>
              <span className="text-xs text-slate-500">{model.version}</span>
            </div>
            <h3 className="text-white font-semibold mb-1">{model.name}</h3>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl font-bold text-cyan-400">{model.accuracy}%</span>
              <span className="text-slate-500 text-sm">accuracy</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{model.predictions.toLocaleString()} predictions</span>
              <span>{model.lastTrained}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Model Accuracy Trends */}
        <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Model Accuracy Trends</h2>
            <select className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-300">
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
          </div>

          <div className="h-48 flex items-end gap-3">
            {accuracyTrends.map((data, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className="w-full bg-gradient-to-t from-cyan-500/80 to-blue-500/80 rounded-t-lg hover:from-cyan-400 hover:to-blue-400 transition-colors cursor-pointer"
                  style={{ height: `${(data.value / 100) * 150}px` }}
                  title={`${data.value}%`}
                />
                <span className="text-xs text-slate-500">{data.week}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-slate-400">Average: 91.5%</span>
            <span className="text-green-400 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              +3.2% this month
            </span>
          </div>
        </div>

        {/* Inference Requests */}
        <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Inference Requests</h2>
            <span className="text-xs text-slate-400">Last 24 hours</span>
          </div>

          <div className="h-48 relative">
            <svg className="w-full h-full" viewBox="0 0 300 150" preserveAspectRatio="none">
              {/* Area fill */}
              <path
                d={`M0,150 L0,${150 - (inferenceData[0].requests / 1200) * 120} ${inferenceData.map((d, i) => 
                  `L${(i / (inferenceData.length - 1)) * 300},${150 - (d.requests / 1200) * 120}`
                ).join(' ')} L300,150 Z`}
                fill="url(#inferenceGradient)"
                opacity="0.3"
              />
              
              {/* Line */}
              <path
                d={`M0,${150 - (inferenceData[0].requests / 1200) * 120} ${inferenceData.map((d, i) => 
                  `L${(i / (inferenceData.length - 1)) * 300},${150 - (d.requests / 1200) * 120}`
                ).join(' ')}`}
                fill="none"
                stroke="#8b5cf6"
                strokeWidth="2"
              />

              <defs>
                <linearGradient id="inferenceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div className="flex justify-between mt-2 text-xs text-slate-500">
            {inferenceData.map((d, i) => (
              <span key={i}>{d.hour}</span>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xl font-bold text-white">42.5K</p>
              <p className="text-xs text-slate-400">Total Requests</p>
            </div>
            <div>
              <p className="text-xl font-bold text-white">23ms</p>
              <p className="text-xs text-slate-400">Avg. Latency</p>
            </div>
            <div>
              <p className="text-xl font-bold text-white">99.9%</p>
              <p className="text-xs text-slate-400">Success Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Model Performance Details */}
      <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Model Performance Details</h2>
          <button className="text-cyan-400 text-sm hover:text-cyan-300 flex items-center gap-1">
            Export Report
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-slate-400 border-b border-slate-800">
                <th className="pb-4 font-medium">Model</th>
                <th className="pb-4 font-medium">Accuracy</th>
                <th className="pb-4 font-medium">Precision</th>
                <th className="pb-4 font-medium">Recall</th>
                <th className="pb-4 font-medium">F1 Score</th>
                <th className="pb-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {performanceMetrics.map((metric, i) => (
                <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                  <td className="py-4 text-white font-medium">{metric.model}</td>
                  <td className="py-4">
                    <span className="text-cyan-400 font-semibold">{metric.accuracy}%</span>
                  </td>
                  <td className="py-4 text-slate-300">{metric.precision}%</td>
                  <td className="py-4 text-slate-300">{metric.recall}%</td>
                  <td className="py-4 text-slate-300">{metric.f1Score}%</td>
                  <td className="py-4">
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                      Healthy
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-2xl p-6 border border-cyan-500/20">
          <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-white font-semibold mb-2">Trend Detected</h3>
          <p className="text-slate-400 text-sm">Passenger traffic from UAE expected to increase 15% next month based on historical patterns.</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-2xl p-6 border border-yellow-500/20">
          <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-white font-semibold mb-2">Anomaly Alert</h3>
          <p className="text-slate-400 text-sm">Unusual spike in departure cancellations detected. 23% above normal rate for this period.</p>
        </div>

        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl p-6 border border-green-500/20">
          <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-white font-semibold mb-2">Optimization</h3>
          <p className="text-slate-400 text-sm">Model suggests peak hours for flights are 8AM-10AM. Consider resource allocation adjustments.</p>
        </div>
      </div>
    </div>
  );
};

export default AIInsights;
