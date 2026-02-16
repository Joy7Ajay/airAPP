import express from 'express';
import { verifyToken, isAdmin } from '../middleware/auth.js';
import db from '../config/db.js';
import {
  aiInsightsData,
  predictionsData,
  dataManagement,
} from '../data/dashboardData.js';
import { loadAiDataset } from '../data/aiDataset.js';

const allowSampleData = String(process.env.ALLOW_SAMPLE_DATA || '').trim().toLowerCase() === 'true';

const permissionsSnapshot = [
  { 
    id: 1,
    name: 'System Administrator',
    email: 'ljoy23200@gmail.com',
    role: 'admin',
    status: 'online',
    permissions: {
      overview: true, analytics: true, ai_insights: true, predictions: true,
      data_view: true, data_import: true, data_export: true,
      users: true, security: true, audit: true
    }
  },
  { 
    id: 2, 
    name: 'Sarah Nakamya', 
    email: 'sarah.n@airapp.ug', 
    role: 'analyst',
    status: 'online',
    permissions: {
      overview: true, analytics: true, ai_insights: true, predictions: true,
      data_view: true, data_import: false, data_export: true,
      users: false, security: false, audit: false
    }
  },
  { 
    id: 3, 
    name: 'John Mukasa', 
    email: 'j.mukasa@airapp.ug', 
    role: 'viewer',
    status: 'offline',
    permissions: {
      overview: true, analytics: true, ai_insights: false, predictions: false,
      data_view: true, data_import: false, data_export: false,
      users: false, security: false, audit: false
    }
  },
  { 
    id: 4, 
    name: 'Grace Atim', 
    email: 'grace.a@airapp.ug', 
    role: 'manager',
    status: 'online',
    permissions: {
      overview: true, analytics: true, ai_insights: true, predictions: true,
      data_view: true, data_import: true, data_export: true,
      users: true, security: false, audit: true
    }
  },
  { 
    id: 5, 
    name: 'David Opio', 
    email: 'd.opio@airapp.ug', 
    role: 'analyst',
    status: 'offline',
    permissions: {
      overview: true, analytics: true, ai_insights: true, predictions: false,
      data_view: true, data_import: false, data_export: true,
      users: false, security: false, audit: false
    }
  },
  { 
    id: 6, 
    name: 'Faith Nambi', 
    email: 'f.nambi@airapp.ug', 
    role: 'viewer',
    status: 'online',
    permissions: {
      overview: true, analytics: false, ai_insights: false, predictions: false,
      data_view: true, data_import: false, data_export: false,
      users: false, security: false, audit: false
    }
  },
];

const router = express.Router();

router.use(verifyToken);
router.use(isAdmin);

const toCsv = (headers, rows) => {
  const escape = (value) => {
    const text = String(value ?? '');
    if (text.includes(',') || text.includes('"') || text.includes('\n')) {
      return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
  };

  const headerLine = headers.map(escape).join(',');
  const body = rows.map((row) => headers.map((key) => escape(row[key])).join(',')).join('\n');
  return `${headerLine}\n${body}\n`;
};

// ===== AI actions =====
router.post('/ai/retrain', (req, res) => {
  const dataset = loadAiDataset();
  const sourceModels = dataset?.models || (allowSampleData ? aiInsightsData.models : []);
  const models = sourceModels.map((model) => ({
    ...model,
    status: 'training',
    lastTrained: 'just now',
  }));

  res.json({
    message: 'Model retraining started',
    models,
  });
});

router.get('/ai/export', (req, res) => {
  const dataset = loadAiDataset();
  const headers = ['model', 'accuracy', 'precision', 'recall', 'f1Score'];
  const csv = toCsv(headers, dataset?.performanceMetrics || (allowSampleData ? aiInsightsData.performanceMetrics : []));
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="ai-model-performance.csv"');
  res.send(csv);
});

// ===== Predictions actions =====
router.post('/predictions/refresh', (req, res) => {
  const dataset = loadAiDataset();
  const sourceInsights = dataset?.aiInsights || (allowSampleData ? predictionsData.aiInsights : []);
  const refreshed = sourceInsights.map((insight) => {
    const jitter = Math.floor(Math.random() * 7) - 3;
    const confidence = Math.min(99, Math.max(70, insight.confidence + jitter));
    return { ...insight, confidence };
  });

  res.json({
    message: 'Insights refreshed',
    aiInsights: refreshed,
  });
});

router.get('/predictions/export', (req, res) => {
  const dataset = loadAiDataset();
  const headers = ['month', 'actual', 'predicted'];
  const csv = toCsv(headers, dataset?.forecastTimeline || (allowSampleData ? predictionsData.forecastTimeline : []));
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="predictions-forecast.csv"');
  res.send(csv);
});

router.post('/predictions/insights/explore', (req, res) => {
  const { index } = req.body;
  const dataset = loadAiDataset();
  const sourceInsights = dataset?.aiInsights || (allowSampleData ? predictionsData.aiInsights : []);
  const insight = sourceInsights[index];
  if (!insight) {
    return res.status(404).json({ message: 'Insight not found' });
  }

  res.json({
    message: 'Insight details loaded',
    insight,
    recommendations: [
      'Review recent traffic trend for supporting evidence.',
      'Cross-check with airline capacity planning data.',
      'Create an experiment to validate the projected change.',
    ],
  });
});

// ===== Data actions =====
router.get('/data/export', (req, res) => {
  const dataset = loadAiDataset();
  const headers = ['month', 'value'];
  const usageTrend = dataset?.monthly?.slice(-6).map((item) => ({
    month: item.monthKey,
    value: Number((item.passengers / 1000).toFixed(2)),
  })) || (allowSampleData ? dataManagement.usageTrend : []);
  const csv = toCsv(headers, usageTrend);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="storage-usage.csv"');
  res.send(csv);
});

router.post('/data/manage', (req, res) => {
  res.json({ message: 'Data management action queued.' });
});

router.get('/data/databases/:name', (req, res) => {
  const dbName = decodeURIComponent(req.params.name);
  const liveDatabases = allowSampleData
    ? dataManagement.databases
    : [{ name: 'airapp.db', type: 'SQLite', size: '0 MB', status: 'healthy', latency: '-' }];
  const database = liveDatabases.find((item) => item.name === dbName);
  if (!database) {
    return res.status(404).json({ message: 'Database not found' });
  }

  res.json({
    database,
    details: {
      connections: Math.floor(Math.random() * 40) + 5,
      replicas: database.type === 'S3' ? 3 : 1,
      uptime: '99.98%',
      lastBackup: '2 hours ago',
    },
  });
});

router.get('/data/imports', (req, res) => {
  res.json({ imports: allowSampleData ? dataManagement.recentImports : [] });
});

router.post('/data/import', (req, res) => {
  const { name, size, records } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'File name required' });
  }
  res.json({
    message: 'Import queued',
    import: {
      name,
      size: size || '0 MB',
      records: records || 0,
      status: 'completed',
      date: 'just now',
    },
  });
});

// ===== Notifications actions =====
router.post('/notifications/clear', (req, res) => {
  const unread = db.prepare('SELECT COUNT(*) as count FROM notifications WHERE is_read = 0').get();
  db.prepare('UPDATE notifications SET is_read = 1').run();
  res.json({ message: 'Notifications cleared', unreadCleared: unread.count });
});

router.get('/notifications/export', (req, res) => {
  const rows = db.prepare(`
    SELECT id, type, message, is_read, created_at
    FROM notifications
    ORDER BY created_at DESC
  `).all();

  const headers = ['id', 'type', 'message', 'is_read', 'created_at'];
  const csv = toCsv(headers, rows);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="notification-history.csv"');
  res.send(csv);
});

router.post('/notifications/alerts', (req, res) => {
  res.json({ message: 'Alert rules configuration opened.' });
});

// ===== Users permissions =====
router.get('/users/permissions', (req, res) => {
  res.json({ users: permissionsSnapshot });
});

export default router;
