import db from '../config/db.js';

export const FEATURE_KEYS = [
  'overview',
  'analytics',
  'ai_insights',
  'predictions',
  'data_view',
  'data_import',
  'data_export',
  'users',
  'security',
  'audit',
];

export const DEFAULT_USER_PERMISSIONS = {
  overview: 1,
  analytics: 1,
  ai_insights: 0,
  predictions: 0,
  data_view: 1,
  data_import: 0,
  data_export: 0,
  users: 0,
  security: 0,
  audit: 0,
};

const ALL_ACCESS = FEATURE_KEYS.reduce((acc, key) => {
  acc[key] = true;
  return acc;
}, {});

const toBoolMap = (input = {}) => FEATURE_KEYS.reduce((acc, key) => {
  acc[key] = Boolean(input[key]);
  return acc;
}, {});

const toDbMap = (input = {}) => FEATURE_KEYS.reduce((acc, key) => {
  acc[key] = input[key] ? 1 : 0;
  return acc;
}, {});

export const getAllAccessPermissions = () => ({ ...ALL_ACCESS });

export const ensureUserPermissions = (userId) => {
  db.prepare(`
    INSERT OR IGNORE INTO user_permissions
    (user_id, overview, analytics, ai_insights, predictions, data_view, data_import, data_export, users, security, audit)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    userId,
    DEFAULT_USER_PERMISSIONS.overview,
    DEFAULT_USER_PERMISSIONS.analytics,
    DEFAULT_USER_PERMISSIONS.ai_insights,
    DEFAULT_USER_PERMISSIONS.predictions,
    DEFAULT_USER_PERMISSIONS.data_view,
    DEFAULT_USER_PERMISSIONS.data_import,
    DEFAULT_USER_PERMISSIONS.data_export,
    DEFAULT_USER_PERMISSIONS.users,
    DEFAULT_USER_PERMISSIONS.security,
    DEFAULT_USER_PERMISSIONS.audit,
  );
};

const rowToPermissions = (row) => {
  if (!row) return toBoolMap(DEFAULT_USER_PERMISSIONS);
  return FEATURE_KEYS.reduce((acc, key) => {
    acc[key] = row[key] === 1;
    return acc;
  }, {});
};

export const getUserPermissions = (userId, role = 'user') => {
  if (role === 'admin') return getAllAccessPermissions();

  ensureUserPermissions(userId);

  const row = db.prepare(`
    SELECT overview, analytics, ai_insights, predictions, data_view, data_import, data_export, users, security, audit
    FROM user_permissions
    WHERE user_id = ?
  `).get(userId);

  return rowToPermissions(row);
};

export const updateUserPermissions = (userId, permissions) => {
  const normalized = toDbMap(toBoolMap(permissions));

  ensureUserPermissions(userId);

  db.prepare(`
    UPDATE user_permissions
    SET overview = ?, analytics = ?, ai_insights = ?, predictions = ?, data_view = ?,
        data_import = ?, data_export = ?, users = ?, security = ?, audit = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = ?
  `).run(
    normalized.overview,
    normalized.analytics,
    normalized.ai_insights,
    normalized.predictions,
    normalized.data_view,
    normalized.data_import,
    normalized.data_export,
    normalized.users,
    normalized.security,
    normalized.audit,
    userId,
  );

  return getUserPermissions(userId, 'user');
};
