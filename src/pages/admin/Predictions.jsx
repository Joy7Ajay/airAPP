import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';

const Predictions = () => {
  const { user, token } = useOutletContext();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedScenario, setSelectedScenario] = useState('optimistic');

  // Prediction stats
  const stats = {
    nextMonth: '$172,000',
    passengers: '58,900',
    growth: '5.4%',
  };

  // Scenario data
  const scenarioData = {
    optimistic: [120, 135, 150, 165, 180, 195, 210],
    baseline: [115, 125, 135, 145, 155, 165, 175],
    conservative: [110, 115, 120, 125, 130, 135, 140],
  };

  // AI Generated insights
  const aiInsights = [
    { 
      type: 'growth', 
      title: 'Strong Revenue Growth Expected',
      description: 'Based on current trends and seasonal patterns, revenue is projected to increase by 18% in Q2.',
      confidence: 92,
      icon: '📈'
    },
    { 
      type: 'trend', 
      title: 'User Acquisition Trending Up',
      description: 'New user signups have increased 25% month-over-month, indicating strong market demand.',
      confidence: 88,
      icon: '👥'
    },
    { 
      type: 'opportunity', 
      title: 'Conversion Optimization Opportunity',
      description: 'Improving checkout flow could increase conversions by 12% based on user behavior analysis.',
      confidence: 85,
      icon: '💡'
    },
    { 
      type: 'risk', 
      title: 'Seasonal Slowdown Expected',
      description: 'Historical data suggests a 15% decrease in traffic during upcoming holiday period.',
      confidence: 90,
      icon: '⚠️'
    },
  ];

  // Forecast timeline
  const forecastTimeline = [
    { month: 'Feb', actual: 42000, predicted: 41500 },
    { month: 'Mar', actual: 45000, predicted: 44800 },
    { month: 'Apr', actual: 48000, predicted: 47500 },
    { month: 'May', actual: null, predicted: 52000 },
    { month: 'Jun', actual: null, predicted: 55000 },
    { month: 'Jul', actual: null, predicted: 58000 },
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
          <p className="text-slate-400 mt-4">Loading predictions...</p>
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
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            Predictions & Forecasting
          </h1>
          <p className="text-slate-400 mt-1">Predictive analytics to anticipate trends and reduce uncertainty.</p>
        </div>
        <button className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl font-medium transition-colors flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export Report
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-slate-400 text-sm">Next Month Revenue</span>
          </div>
          <p className="text-3xl font-bold text-white">{stats.nextMonth}</p>
          <span className="text-green-400 text-sm">+12.5% projected growth</span>
        </div>

        <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <span className="text-slate-400 text-sm">Expected Passengers</span>
          </div>
          <p className="text-3xl font-bold text-white">{stats.passengers}</p>
          <span className="text-green-400 text-sm">+8.2% from current</span>
        </div>

        <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span className="text-slate-400 text-sm">Growth Rate</span>
          </div>
          <p className="text-3xl font-bold text-white">{stats.growth}</p>
          <span className="text-green-400 text-sm">Above market average</span>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scenario Analysis */}
        <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Scenario Analysis</h2>
            <div className="flex gap-2">
              {['optimistic', 'baseline', 'conservative'].map((scenario) => (
                <button
                  key={scenario}
                  onClick={() => setSelectedScenario(scenario)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    selectedScenario === scenario
                      ? scenario === 'optimistic' ? 'bg-green-500 text-white' :
                        scenario === 'baseline' ? 'bg-cyan-500 text-white' :
                        'bg-yellow-500 text-black'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {scenario.charAt(0).toUpperCase() + scenario.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="h-48 flex items-end gap-3">
            {scenarioData[selectedScenario].map((value, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className={`w-full rounded-t-lg transition-all duration-300 ${
                    selectedScenario === 'optimistic' ? 'bg-gradient-to-t from-green-500/80 to-emerald-500/80' :
                    selectedScenario === 'baseline' ? 'bg-gradient-to-t from-cyan-500/80 to-blue-500/80' :
                    'bg-gradient-to-t from-yellow-500/80 to-orange-500/80'
                  }`}
                  style={{ height: `${(value / 220) * 150}px` }}
                />
                <span className="text-xs text-slate-500">M{i + 1}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 bg-slate-800/50 rounded-xl">
            <p className="text-sm text-slate-400">
              <span className="text-white font-medium">
                {selectedScenario === 'optimistic' ? '📈 Growth trajectory: +75% by month 7' :
                 selectedScenario === 'baseline' ? '📊 Steady growth: +52% by month 7' :
                 '📉 Conservative estimate: +27% by month 7'}
              </span>
            </p>
          </div>
        </div>

        {/* Revenue Forecast with Confidence Interval */}
        <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Revenue Forecast with Confidence Interval</h2>
          </div>

          <div className="h-48 relative">
            <svg className="w-full h-full" viewBox="0 0 300 150" preserveAspectRatio="none">
              {/* Confidence interval band */}
              <path
                d="M0,100 Q75,80 150,60 T300,20 L300,60 Q225,80 150,100 T0,140 Z"
                fill="rgba(6, 182, 212, 0.1)"
                stroke="none"
              />
              
              {/* Actual data line */}
              <path
                d="M0,100 L50,95 L100,85"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="2"
              />
              
              {/* Predicted data line (dashed) */}
              <path
                d="M100,85 L150,70 L200,55 L250,40 L300,25"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="2"
                strokeDasharray="5,5"
              />

              {/* Data points */}
              <circle cx="0" cy="100" r="4" fill="#06b6d4" />
              <circle cx="50" cy="95" r="4" fill="#06b6d4" />
              <circle cx="100" cy="85" r="4" fill="#06b6d4" />
              <circle cx="150" cy="70" r="4" fill="#06b6d4" opacity="0.5" />
              <circle cx="200" cy="55" r="4" fill="#06b6d4" opacity="0.5" />
              <circle cx="250" cy="40" r="4" fill="#06b6d4" opacity="0.5" />
            </svg>

            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-slate-500">
              <span>$60K</span>
              <span>$40K</span>
              <span>$20K</span>
            </div>
          </div>

          <div className="flex justify-between mt-4 text-xs text-slate-500">
            {forecastTimeline.map((d, i) => (
              <span key={i} className={d.actual === null ? 'text-cyan-400' : ''}>{d.month}</span>
            ))}
          </div>

          <div className="flex items-center gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-cyan-500"></div>
              <span className="text-slate-400">Actual</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-cyan-500" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #06b6d4, #06b6d4 3px, transparent 3px, transparent 6px)' }}></div>
              <span className="text-slate-400">Forecast</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-3 bg-cyan-500/20 rounded"></div>
              <span className="text-slate-400">95% CI</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Generated Insights Stream */}
      <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            AI Generated Insights Stream
          </h2>
          <button className="text-cyan-400 text-sm hover:text-cyan-300">Refresh</button>
        </div>

        <div className="space-y-4">
          {aiInsights.map((insight, i) => (
            <div 
              key={i} 
              className={`p-4 rounded-xl border transition-colors hover:bg-slate-800/50 ${
                insight.type === 'growth' ? 'bg-green-500/5 border-green-500/20' :
                insight.type === 'trend' ? 'bg-cyan-500/5 border-cyan-500/20' :
                insight.type === 'opportunity' ? 'bg-purple-500/5 border-purple-500/20' :
                'bg-yellow-500/5 border-yellow-500/20'
              }`}
            >
              <div className="flex items-start gap-4">
                <span className="text-2xl">{insight.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-white font-medium">{insight.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      insight.type === 'growth' ? 'bg-green-500/20 text-green-400' :
                      insight.type === 'trend' ? 'bg-cyan-500/20 text-cyan-400' :
                      insight.type === 'opportunity' ? 'bg-purple-500/20 text-purple-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {insight.confidence}% confidence
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm">{insight.description}</p>
                </div>
                <button className="text-cyan-400 hover:text-cyan-300 text-sm">
                  Explore →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Predictions;
