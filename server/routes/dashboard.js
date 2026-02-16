import express from 'express';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { verifyToken, isAdmin } from '../middleware/auth.js';
import db from '../config/db.js';
import {
  overviewData,
  analyticsData,
  aiInsightsData,
  predictionsData,
  airportsData,
  dataManagement,
} from '../data/dashboardData.js';
import { loadAiDataset } from '../data/aiDataset.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DB_PATH = join(__dirname, '..', 'airapp.db');
const allowSampleData = String(process.env.ALLOW_SAMPLE_DATA || '').trim().toLowerCase() === 'true';

const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const zeroMonthSeries = () => monthLabels.map((month) => ({ month, arrivals: 0, departures: 0, value: 0 }));
const emptyDataResponse = () => ({
  storage: { total: 0, used: 0, growth: 0, activeQueries: 0 },
  bubbleData: { '1W': [], '1M': [], '3M': [], '1Y': [], ALL: [] },
  bubbleStats: {
    '1W': { records: 0, queries: 0, syncs: 0 },
    '1M': { records: 0, queries: 0, syncs: 0 },
    '3M': { records: 0, queries: 0, syncs: 0 },
    '1Y': { records: 0, queries: 0, syncs: 0 },
    ALL: { records: 0, queries: 0, syncs: 0 },
  },
  databases: [],
  recentImports: [],
  usageTrend: [],
  transferMetrics: [],
});

const airportMeta = {
  EBB: { name: 'Entebbe International Airport', type: 'international', lat: 0.0424, lng: 32.4435 },
  ULU: { name: 'Gulu Airport', type: 'domestic', lat: 2.8056, lng: 32.2719 },
  PAF: { name: 'Pakuba Airfield', type: 'airstrip', lat: 2.3264, lng: 31.5 },
  SRT: { name: 'Soroti Airport', type: 'domestic', lat: 1.7278, lng: 33.6228 },
  RUA: { name: 'Arua Airport', type: 'domestic', lat: 3.0497, lng: 30.9108 },
};

const buildAirportsFromDataset = (dataset) => {
  if (!dataset?.byAirport?.length) return { airports: [], routes: [] };
  const airports = dataset.byAirport.map((item, index) => {
    const meta = airportMeta[item.airportCode] || {};
    const traffic = item.arrivals + item.departures;
    return {
      id: index + 1,
      name: meta.name || `${item.airportCode} Airport`,
      code: item.airportCode,
      type: meta.type || 'domestic',
      lat: meta.lat || 0,
      lng: meta.lng || 0,
      passengers: item.passengers,
      flights: traffic,
      status: item.passengers > 500000 ? 'high' : item.passengers > 150000 ? 'medium' : 'low',
      description: 'Derived from imported operational dataset',
      runways: 1,
      airlines: [],
    };
  });
  const hubIndex = airports.findIndex((item) => item.code === 'EBB');
  const routes = hubIndex >= 0
    ? airports
      .filter((item) => item.code !== 'EBB')
      .map((item) => ({ from: hubIndex, to: airports.findIndex((a) => a.code === item.code), passengers: item.passengers }))
    : [];
  return { airports, routes };
};

router.use(verifyToken);
router.use(isAdmin);


router.get('/overview', (req, res) => {
  const dataset = loadAiDataset();
  if (!dataset) {
    if (allowSampleData) return res.json({ ...overviewData, updatedAt: new Date().toISOString() });
    return res.json({
      stats: { totalArrivals: 0, totalDepartures: 0, growthRate: 0, activeAirlines: 0 },
      topAirlines: [],
      topDestinations: [],
      recentActivity: [],
      monthlyData: zeroMonthSeries().map((item) => ({ month: item.month, arrivals: 0, departures: 0 })),
      updatedAt: new Date().toISOString(),
    });
  }

  const monthlyData = dataset.monthly.slice(-12).map((item) => ({
    month: monthLabels[Number(item.monthKey.slice(5, 7)) - 1],
    arrivals: item.arrivals,
    departures: item.departures,
  }));
  const last = dataset.monthly[dataset.monthly.length - 1];
  const prev = dataset.monthly[dataset.monthly.length - 2] || last;
  const growthRate = prev.passengers > 0
    ? (((last.passengers - prev.passengers) / prev.passengers) * 100)
    : 0;
  const stats = {
    totalArrivals: dataset.monthly.reduce((sum, item) => sum + item.arrivals, 0),
    totalDepartures: dataset.monthly.reduce((sum, item) => sum + item.departures, 0),
    growthRate: Number(growthRate.toFixed(1)),
    activeAirlines: 0,
  };
  const recentActivity = db.prepare(`
    SELECT action, created_at
    FROM audit_logs
    ORDER BY created_at DESC
    LIMIT 5
  `).all().map((item) => ({
    type: 'system',
    flight: item.action,
    airline: 'N/A',
    from: 'N/A',
    to: 'N/A',
    time: item.created_at,
    status: 'logged',
  }));

  return res.json({
    stats,
    topAirlines: [],
    topDestinations: [],
    recentActivity,
    monthlyData,
    updatedAt: new Date().toISOString(),
  });
});

router.get('/analytics', (req, res) => {
  const { range } = req.query;
  const dataset = loadAiDataset();
  if (!dataset) {
    if (allowSampleData) return res.json({ ...analyticsData, range: range || 'default', updatedAt: new Date().toISOString() });
    return res.json({
      stats: { pageViews: '0', uniqueVisitors: '0', avgSession: '0m 00s', bounceRate: '0.0' },
      monthlyTrend: zeroMonthSeries().map((item) => ({ month: item.month, value: 0 })),
      engagementMetrics: [],
      hourlyData: Array.from({ length: 24 }, (_x, hour) => ({ hour, value: 0 })),
      countryData: [],
      range: range || 'default',
      updatedAt: new Date().toISOString(),
    });
  }

  const last = dataset.monthly[dataset.monthly.length - 1];
  const auditCount = db.prepare('SELECT COUNT(*) as count FROM audit_logs').get().count;
  const approvedUsers = db.prepare("SELECT COUNT(*) as count FROM users WHERE status = 'approved' AND (is_deleted = 0 OR is_deleted IS NULL)").get().count;
  const hourlyRaw = db.prepare(`
    SELECT CAST(strftime('%H', created_at) AS INTEGER) as hour, COUNT(*) as total
    FROM audit_logs
    GROUP BY hour
  `).all();
  const hourlyMap = new Map(hourlyRaw.map((item) => [item.hour, item.total]));
  const monthlyTrend = dataset.monthly.slice(-12).map((item) => ({
    month: monthLabels[Number(item.monthKey.slice(5, 7)) - 1],
    value: Math.round(item.passengers / 1000),
  }));

  return res.json({
    stats: {
      pageViews: (last.passengers * 12).toLocaleString(),
      uniqueVisitors: String(approvedUsers),
      avgSession: '3m 20s',
      bounceRate: '4.1',
    },
    monthlyTrend,
    engagementMetrics: [
      { label: 'Audit Events', value: Math.min(100, Math.max(1, Math.round(auditCount / 10))), color: 'cyan' },
      { label: 'Approved Users', value: Math.min(100, Math.max(1, approvedUsers)), color: 'blue' },
    ],
    hourlyData: Array.from({ length: 24 }, (_x, hour) => ({ hour, value: hourlyMap.get(hour) || 0 })),
    countryData: [],
    range: range || 'default',
    updatedAt: new Date().toISOString(),
  });
});

router.get('/ai-insights', (req, res) => {
  const dataset = loadAiDataset();
  if (!dataset) {
    if (allowSampleData) return res.json({ ...aiInsightsData, updatedAt: new Date().toISOString() });
    return res.json({
      models: [],
      accuracyTrends: [],
      inferenceData: [],
      performanceMetrics: [],
      updatedAt: new Date().toISOString(),
    });
  }
  return res.json({
    models: dataset.models,
    accuracyTrends: dataset.accuracyTrends,
    inferenceData: dataset.inferenceData,
    performanceMetrics: dataset.performanceMetrics,
    updatedAt: new Date().toISOString(),
  });
});

router.get('/predictions', (req, res) => {
  const dataset = loadAiDataset();
  if (!dataset) {
    if (allowSampleData) return res.json({ ...predictionsData, updatedAt: new Date().toISOString() });
    return res.json({
      stats: { nextMonth: '$0k', passengers: '0', growth: '0.0%' },
      scenarioData: { optimistic: [], baseline: [], conservative: [] },
      aiInsights: [],
      forecastTimeline: [],
      updatedAt: new Date().toISOString(),
    });
  }
  return res.json({
    stats: dataset.predictionStats,
    scenarioData: dataset.scenarioData,
    aiInsights: dataset.aiInsights,
    forecastTimeline: dataset.forecastTimeline,
    updatedAt: new Date().toISOString(),
  });
});

router.get('/airports', (req, res) => {
  const dataset = loadAiDataset();
  if (!dataset) {
    if (allowSampleData) return res.json({ ...airportsData, updatedAt: new Date().toISOString() });
    return res.json({ airports: [], routes: [], updatedAt: new Date().toISOString() });
  }
  const airportData = buildAirportsFromDataset(dataset);
  return res.json({ ...airportData, updatedAt: new Date().toISOString() });
});

router.get('/data', (req, res) => {
  if (!allowSampleData) {
    const dataset = loadAiDataset();
    const fallback = emptyDataResponse();
    const dbSizeGb = fs.existsSync(DB_PATH) ? fs.statSync(DB_PATH).size / (1024 * 1024 * 1024) : 0;
    const rows = dataset?.rows || [];
    const monthly = dataset?.monthly || [];
    const queryCount = db.prepare('SELECT COUNT(*) as count FROM audit_logs').get().count;

    return res.json({
      storage: {
        total: Number((dbSizeGb * 1.6).toFixed(2)),
        used: Number(dbSizeGb.toFixed(2)),
        growth: 0,
        activeQueries: queryCount,
      },
      bubbleData: {
        ...fallback.bubbleData,
        ALL: [
          { name: 'Flight Records', value: rows.length, size: 80, x: 50, y: 45 },
          { name: 'Monthly Buckets', value: monthly.length, size: 60, x: 25, y: 35 },
          { name: 'Audit Logs', value: queryCount, size: 50, x: 75, y: 30 },
        ],
      },
      bubbleStats: {
        ...fallback.bubbleStats,
        ALL: { records: rows.length, queries: queryCount, syncs: 0 },
      },
      databases: [
        { name: 'airapp.db', type: 'SQLite', size: `${(dbSizeGb * 1024).toFixed(2)} MB`, status: 'healthy', latency: '-' },
      ],
      recentImports: [],
      usageTrend: monthly.slice(-6).map((item) => ({
        month: monthLabels[Number(item.monthKey.slice(5, 7)) - 1],
        value: Number((item.passengers / 1000).toFixed(2)),
      })),
      transferMetrics: [
        { type: 'Inbound', value: 0, unit: 'records/day', trend: 'stable' },
        { type: 'Outbound', value: 0, unit: 'records/day', trend: 'stable' },
        { type: 'API Calls', value: queryCount, unit: '/day', trend: 'stable' },
      ],
      updatedAt: new Date().toISOString(),
    });
  }

  return res.json({ ...dataManagement, updatedAt: new Date().toISOString() });
});

export default router;
