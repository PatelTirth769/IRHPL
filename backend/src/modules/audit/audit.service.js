const { db } = require('../../config/firebase');

const AUDIT_COLLECTION = 'audit_logs';

/**
 * Log an audit event
 */
const logEvent = async ({ action, actorId, targetId, targetType, description, metadata = {} }) => {
  try {
    const entry = {
      action,
      actorId: actorId || 'system',
      targetId,
      targetType,
      description,
      metadata,
      timestamp: new Date().toISOString()
    };
    await db().collection(AUDIT_COLLECTION).add(entry);
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
};

/**
 * Get audit logs with optional filters
 */
const getLogs = async (filters = {}) => {
  const snapshot = await db().collection(AUDIT_COLLECTION).get();
  let logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  if (filters.action) {
    logs = logs.filter(log => log.action === filters.action);
  }
  if (filters.targetId) {
    logs = logs.filter(log => log.targetId === filters.targetId);
  }
  if (filters.actorId) {
    logs = logs.filter(log => log.actorId === filters.actorId);
  }

  // Sorting descending by timestamp
  logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return logs;
};

module.exports = {
  logEvent,
  getLogs
};
