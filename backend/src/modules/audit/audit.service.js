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
    const actUpper = String(filters.action).toUpperCase();
    if (actUpper === 'CREATION') {
      logs = logs.filter(log => {
        const a = String(log.action || '').toUpperCase();
        return a.includes('CREATE') || a.includes('SUBMIT');
      });
    } else if (actUpper === 'UPDATION' || actUpper === 'UPDATE') {
      logs = logs.filter(log => {
        const a = String(log.action || '').toUpperCase();
        return a.includes('UPDATE') || a.includes('RENEW') || a.includes('EDIT');
      });
    } else if (actUpper === 'DELETION' || actUpper === 'DELETE') {
      logs = logs.filter(log => {
        const a = String(log.action || '').toUpperCase();
        return a.includes('DELETE') || a.includes('CANCEL');
      });
    } else {
      logs = logs.filter(log => log.action === filters.action);
    }
  }
  if (filters.targetType) {
    logs = logs.filter(log => log.targetType === filters.targetType);
  }
  if (filters.targetId) {
    const tid = String(filters.targetId).toLowerCase().trim();
    logs = logs.filter(log => log.targetId && String(log.targetId).toLowerCase().includes(tid));
  }
  if (filters.actorId) {
    const aid = String(filters.actorId).toLowerCase().trim();
    logs = logs.filter(log => log.actorId && String(log.actorId).toLowerCase().includes(aid));
  }
  if (filters.search) {
    const q = String(filters.search).toLowerCase().trim();
    logs = logs.filter(log =>
      (log.targetId && String(log.targetId).toLowerCase().includes(q)) ||
      (log.description && String(log.description).toLowerCase().includes(q)) ||
      (log.action && String(log.action).toLowerCase().includes(q)) ||
      (log.actorId && String(log.actorId).toLowerCase().includes(q)) ||
      (log.targetType && String(log.targetType).toLowerCase().includes(q))
    );
  }

  // Sorting descending by timestamp
  logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return logs;
};

module.exports = {
  logEvent,
  getLogs
};
