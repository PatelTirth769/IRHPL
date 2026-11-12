const { db } = require('../../config/firebase');
const ApiError = require('../../utils/ApiError');
const auditService = require('../audit/audit.service');

const C_COMPANIES = 'lm_companies';
const C_LOCATIONS = 'lm_locations';
const C_ZONES = 'lm_zones';
const C_STORES = 'lm_stores';
const C_GOV_BODIES = 'lm_gov_bodies';
const C_LICENSES = 'lm_licenses';

const getCollection = async (collectionName) => {
  const snapshot = await db().collection(collectionName).orderBy('createdAt', 'desc').get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

const createEntity = async (collectionName, data, userId) => {
  const newEntity = {
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  const docRef = await db().collection(collectionName).add(newEntity);
  
  await auditService.logEvent({
    action: `${collectionName.toUpperCase()}_CREATED`,
    actorId: userId,
    targetId: docRef.id,
    targetType: collectionName,
    description: `Created new entity in ${collectionName}`
  });

  return { id: docRef.id, ...newEntity };
};

const updateEntity = async (collectionName, id, data, userId) => {
  const docRef = db().collection(collectionName).doc(id);
  const doc = await docRef.get();
  if (!doc.exists) throw new ApiError(404, 'Entity not found');

  const updates = {
    ...data,
    updatedAt: new Date().toISOString()
  };

  await docRef.update(updates);

  await auditService.logEvent({
    action: `${collectionName.toUpperCase()}_UPDATED`,
    actorId: userId,
    targetId: id,
    targetType: collectionName,
    description: `Updated entity in ${collectionName}`
  });

  return { id, ...doc.data(), ...updates };
};

const deleteEntity = async (collectionName, id, userId) => {
  const docRef = db().collection(collectionName).doc(id);
  const doc = await docRef.get();
  if (!doc.exists) throw new ApiError(404, 'Entity not found');

  await docRef.delete();

  await auditService.logEvent({
    action: `${collectionName.toUpperCase()}_DELETED`,
    actorId: userId,
    targetId: id,
    targetType: collectionName,
    description: `Deleted entity from ${collectionName}`
  });

  return { success: true };
};

// --- License Specific Logic ---

const PIPELINES = {
  'trade-license': [
    'Draft',
    'Application Submitted',
    'Under Process',
    'Issued/Active',
    'Renewal Due',
    'Renewal Submitted',
    'Expired'
  ]
};

const updateLicenseStatus = async (id, newStatus, remarks = '', userId) => {
  const docRef = db().collection(C_LICENSES).doc(id);
  const doc = await docRef.get();
  if (!doc.exists) throw new ApiError(404, 'License not found');
  
  const license = doc.data();
  
  const newHistoryEntry = {
    status: newStatus,
    date: new Date().toISOString(),
    remarks,
    updatedBy: userId
  };

  const updates = {
    status: newStatus,
    statusHistory: [...(license.statusHistory || []), newHistoryEntry],
    updatedAt: new Date().toISOString()
  };

  await docRef.update(updates);

  await auditService.logEvent({
    action: 'LICENSE_STATUS_UPDATED',
    actorId: userId,
    targetId: id,
    targetType: C_LICENSES,
    description: `License status changed from '${license.status}' to '${newStatus}'`,
    metadata: { previousStatus: license.status, newStatus, remarks }
  });

  return { id, ...license, ...updates };
};

const addLicenseModification = async (id, type, details, date, documents, userId) => {
  const docRef = db().collection(C_LICENSES).doc(id);
  const doc = await docRef.get();
  if (!doc.exists) throw new ApiError(404, 'License not found');
  
  const license = doc.data();

  const modEntry = {
    id: Date.now().toString(),
    type, // Modification, Cancellation, Extension
    details,
    date,
    documents: documents || [],
    createdAt: new Date().toISOString()
  };

  const updates = {
    cancellationExtensionModification: [...(license.cancellationExtensionModification || []), modEntry],
    updatedAt: new Date().toISOString()
  };

  // If cancellation, update status
  if (type === 'Cancellation') {
    updates.status = 'Cancelled';
    const newHistoryEntry = {
      status: 'Cancelled',
      date: new Date().toISOString(),
      remarks: 'Cancelled via modification',
      updatedBy: userId
    };
    updates.statusHistory = [...(license.statusHistory || []), newHistoryEntry];
  }
  // If extension or modification, update validityEndDate
  if ((type === 'Extension' || type === 'Modification') && date) {
    const parsedDate = new Date(date).toISOString().split('T')[0];
    updates.validityEndDate = parsedDate;
    
    // Also update renewalDueDate
    const d = new Date(parsedDate);
    d.setDate(d.getDate() - 30);
    updates.renewalDueDate = d.toISOString().split('T')[0];
  }

  await docRef.update(updates);

  await auditService.logEvent({
    action: `LICENSE_${type.toUpperCase()}`,
    actorId: userId,
    targetId: id,
    targetType: C_LICENSES,
    description: `Added ${type} to license`
  });

  return { id, ...license, ...updates };
};

const updateLicenseDocuments = async (id, documents, userId) => {
  const docRef = db().collection(C_LICENSES).doc(id);
  const doc = await docRef.get();
  if (!doc.exists) throw new ApiError(404, 'License not found');
  
  const updates = {
    documentsRequired: documents,
    updatedAt: new Date().toISOString()
  };

  await docRef.update(updates);
  return { id, ...doc.data(), ...updates };
};

const getExpiryReminders = async (window = '30') => {
  const snapshot = await db().collection(C_LICENSES).get();
  const licenses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  const today = new Date();
  const windowDays = parseInt(window);
  const futureDate = new Date(today.getTime() + windowDays * 24 * 60 * 60 * 1000);
  
  // Find licenses where validityEndDate is between today and futureDate, or already expired but active
  const expiringLicenses = licenses.filter(lic => {
    if (!lic.validityEndDate) return false;
    if (lic.status === 'Cancelled' || lic.status === 'Expired') return false;
    
    const expiryDate = new Date(lic.validityEndDate);
    return expiryDate <= futureDate;
  });
  
  // Sort by closest expiry first
  return expiringLicenses.sort((a, b) => new Date(a.validityEndDate) - new Date(b.validityEndDate));
};

module.exports = {
  C_COMPANIES,
  C_LOCATIONS,
  C_ZONES,
  C_STORES,
  C_GOV_BODIES,
  C_LICENSES,
  getCollection,
  createEntity,
  updateEntity,
  deleteEntity,
  updateLicenseStatus,
  addLicenseModification,
  updateLicenseDocuments,
  getExpiryReminders
};
