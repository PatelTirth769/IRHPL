const { db } = require('../../config/firebase');
const ApiError = require('../../utils/ApiError');
const auditService = require('../audit/audit.service');
const checklistService = require('../checklist/checklist.service');

const PASS_COLLECTION = 'passes';

const PIPELINES = {
  '4-hour': ['documents_submitted', 'commercial_signoff', 'issued'],
  '1-3-day': ['documents_submitted', 'commercial_signoff', 'issued'],
  'taep-fresh-30': ['documents_submitted', 'avsec_training_applied', 'ca_applied', 'commercial_signoff', 'ca_approved_bcas', 'issued'],
  'taep-forwarding-60': ['documents_submitted', 'avsec_verified', 'ca_verified', 'commercial_signoff', 'forwarded_to_dial_bcas', 'issued'],
  'baep': ['avsec_ca_complete', 'applied_reference_generated', 'under_scrutiny', 'approved', 'committee_approval', 'biometric_scheduled', 'issued']
};

const getDocumentChecklist = (passType) => {
  const getDocs = () => {
    switch (passType) {
      case '4-hour':
      case '1-3-day':
        return ['2 ID Proofs', 'Passport Photo (White BG)', 'Company ID', 'Official Email (Purpose)', 'Pass Surrender Copy (if TAEP held)'];
      case 'taep-fresh-30':
        return ['Passport + Aadhaar + PAN Card', 'Passport Photo (White BG)', 'C&A Application Proof (Day 1)', 'AVSEC Application Proof (Day 1)'];
      case 'taep-forwarding-60':
        return ['AVSEC Certificate (Valid)', 'C&A Verification (Valid)', 'TAEP Receiving Proof'];
      case 'baep':
        return ['AVSEC Certificate (Complete)', 'C&A Verification (Complete)', 'BAEP/TAEP Receiving Proof'];
      default:
        return [];
    }
  };
  
  return getDocs().map(doc => ({
    type: doc,
    fileUrl: null,
    uploadedDate: null,
    expiryDate: null,
    status: 'pending'
  }));
};

/**
 * Helper to calculate expected completion date
 */
const calculateExpectedCompletionDate = (passType, appliedDate = new Date()) => {
  const durations = {
    '4-hour': 2,
    '1-3-day': 3,
    'taep-fresh-30': 3,
    'taep-forwarding-60': 4,
    'baep': 35
  };
  
  const daysToAdd = durations[passType] || 0;
  const expectedDate = new Date(appliedDate);
  expectedDate.setDate(expectedDate.getDate() + daysToAdd);
  return expectedDate;
};

/**
 * Validate eligibility rules
 */
const validateEligibility = async (data) => {
  if (data.passType === 'taep-fresh-30' && data.hasWorkedAtAirportBefore) {
    throw new ApiError(400, 'Applicant has worked at the airport before. Cannot apply for Fresh TAEP.');
  }

  if (data.passType === 'taep-forwarding-60' && data.applicantType === 'external-personnel') {
    throw new ApiError(400, 'External personnel are only eligible for Fresh TAEP (30 days) and are not eligible for TAEP Forwarding.');
  }

  if (data.passType === 'taep-forwarding-60' && !data.hasValidPrereqsForForwarding) {
    throw new ApiError(400, 'Applicant must have a valid AVSEC, C&A, and past TAEP Receiving proof to apply for Forwarding.');
  }

  let totalTaepDaysUsed = data.taepDaysConsumedPreviously || 0;
  
  if (data.applicantName) {
    const snapshot = await db().collection(PASS_COLLECTION)
      .where('applicantName', '==', data.applicantName)
      .get();
      
    snapshot.forEach(doc => {
      const pass = doc.data();
      if (pass.status !== 'reverted') {
        if (pass.passType === 'taep-fresh-30') {
          totalTaepDaysUsed += 30;
        } else if (pass.passType === 'taep-forwarding-60') {
          totalTaepDaysUsed += 60;
        }
      }
    });
  }

  if (data.passType === 'taep-forwarding-60' && (totalTaepDaysUsed + 60 > 90)) {
    throw new ApiError(400, `This employee has already used ${totalTaepDaysUsed} of 90 allowed TAEP days. Forwarding cannot be applied — please proceed with BAEP instead.`);
  }

  if (totalTaepDaysUsed >= 90 && data.passType !== 'baep') {
    throw new ApiError(400, 'Applicant has consumed 90 or more TAEP days. Must apply for BAEP only.');
  }
};

/**
 * Create a new pass application
 */
const createPass = async (passData, userId) => {
  await validateEligibility(passData);

  const appliedDate = new Date();
  const expectedCompletionDate = calculateExpectedCompletionDate(passData.passType, appliedDate);
  
  const initialStatus = passData.passType === 'baep' ? 'avsec_ca_complete' : 'documents_submitted';

  const newPass = {
    ...passData,
    createdBy: userId,
    status: initialStatus,
    appliedDate: appliedDate.toISOString(),
    expectedCompletionDate: expectedCompletionDate.toISOString(),
    documents: getDocumentChecklist(passData.passType),
    remindersSent: [],
    statusHistory: [{
      status: initialStatus,
      date: appliedDate.toISOString(),
      remarks: 'Application submitted'
    }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const docRef = await db().collection(PASS_COLLECTION).add(newPass);

  // Generate procedural checklist for the new pass
  await checklistService.generateChecklistForPass(docRef.id, passData, userId, userId);

  await auditService.logEvent({
    action: 'PASS_CREATED',
    actorId: userId,
    targetId: docRef.id,
    targetType: 'pass_application',
    description: `Pass application created for ${passData.applicantName}`
  });

  return { id: docRef.id, ...newPass };
};

/**
 * Get all passes
 */
const getPasses = async (filters = {}) => {
  let query = db().collection(PASS_COLLECTION);
  
  // Basic filtering
  if (filters.status) {
    query = query.where('status', '==', filters.status);
  }
  if (filters.passType) {
    query = query.where('passType', '==', filters.passType);
  }

  const snapshot = await query.get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * Get pass by ID
 */
const getPassById = async (id) => {
  const doc = await db().collection(PASS_COLLECTION).doc(id).get();
  if (!doc.exists) {
    throw new ApiError(404, 'Pass application not found');
  }
  return { id: doc.id, ...doc.data() };
};

/**
 * Update pass status with revert handling
 */
const updatePassStatus = async (id, newStatus, remarks = '', userId) => {
  const pass = await getPassById(id);
  const pipeline = PIPELINES[pass.passType] || [];
  
  // Validation for strict pipeline enforcement
  const currentIndex = pipeline.indexOf(pass.status);
  const requestedIndex = pipeline.indexOf(newStatus);
  
  // For BAEP reverts
  if (pass.passType === 'baep' && pass.status === 'reverted' && newStatus === 'under_scrutiny') {
    // This transition is allowed
  } else if (newStatus === 'reverted' && pass.passType === 'baep') {
    // Reverting is allowed for BAEP
  } else {
    // Standard pipeline enforcement: must move forward exactly one step
    if (requestedIndex !== currentIndex + 1) {
      throw new ApiError(400, `Cannot skip pipeline steps. Next valid status is ${pipeline[currentIndex + 1]}`);
    }
  }
  
  const updates = {
    status: newStatus,
    updatedAt: new Date().toISOString()
  };

  // C&A applied due date logic (due next day)
  if (newStatus === 'ca_applied') {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 1);
    updates.dueDate = dueDate.toISOString();
  }

  // Handle reverted -> resubmitted logic for BAEP
  if (pass.passType === 'baep' && pass.status === 'reverted' && newStatus === 'under_scrutiny') {
    // Reset expected completion date
    const resubmittedDate = new Date();
    updates.expectedCompletionDate = calculateExpectedCompletionDate('baep', resubmittedDate).toISOString();
  }

  // Trigger Revert Email
  if (newStatus === 'reverted') {
    const { sendEmail } = require('../../services/email.service');
    sendEmail(
      'admin@irhpl.com', 
      `Application Reverted: ${pass.applicantName}`,
      `The pass application for ${pass.applicantName} was reverted with the following reason:\n\n"${remarks}"\n\nPlease address this immediately.`
    ).catch(e => console.error('Failed to send revert email', e));
  }

  const newHistoryEntry = {
    status: newStatus,
    date: new Date().toISOString(),
    remarks
  };

  updates.statusHistory = [...(pass.statusHistory || []), newHistoryEntry];

  await db().collection(PASS_COLLECTION).doc(id).update(updates);

  await auditService.logEvent({
    action: 'STATUS_UPDATED',
    actorId: userId,
    targetId: id,
    targetType: 'pass_application',
    description: `Status changed from '${pass.status}' to '${newStatus}'`,
    metadata: { previousStatus: pass.status, newStatus, remarks }
  });

  return { ...pass, ...updates };
};

/**
 * Update pass documents
 */
const updatePassDocuments = async (id, documents, userId) => {
  const pass = await getPassById(id);
  
  const updates = {
    documents,
    updatedAt: new Date().toISOString()
  };

  await db().collection(PASS_COLLECTION).doc(id).update(updates);

  await auditService.logEvent({
    action: 'DOCUMENTS_UPDATED',
    actorId: userId,
    targetId: id,
    targetType: 'pass_application',
    description: `Documents updated for pass application`
  });

  return { ...pass, ...updates };
};

const cancelPass = async (id, reason, date, userId) => {
  const pass = await getPassById(id);
  
  if (pass.status === 'cancelled') {
    throw new ApiError(400, 'Pass is already cancelled');
  }

  const updates = {
    status: 'cancelled',
    updatedAt: new Date().toISOString()
  };

  const newHistoryEntry = {
    status: 'cancelled',
    date: date || new Date().toISOString(),
    remarks: reason
  };

  updates.statusHistory = [...(pass.statusHistory || []), newHistoryEntry];

  await db().collection(PASS_COLLECTION).doc(id).update(updates);

  await auditService.logEvent({
    action: 'PASS_CANCELLED',
    actorId: userId,
    targetId: id,
    targetType: 'pass_application',
    description: `Pass application cancelled. Reason: ${reason}`,
    metadata: { reason, previousStatus: pass.status, newStatus: 'cancelled' }
  });

  return { ...pass, ...updates };
};

const deletePass = async (id) => {
  const docRef = db().collection(PASS_COLLECTION).doc(id);
  const doc = await docRef.get();
  
  if (!doc.exists) {
    throw new ApiError(404, 'Pass application not found');
  }

  await docRef.delete();
  return { id };
};

const getExpiryReminders = async (window = 'all') => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const results = [];

  // Helper to check window and add to results
  const checkAndAdd = (dateStr, applicantName, applicantType, passType, documentType, passId = null) => {
    if (!dateStr) return;
    const expiry = new Date(dateStr);
    const expiryDay = new Date(expiry.getFullYear(), expiry.getMonth(), expiry.getDate());
    const diffTime = expiryDay - today;
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let matches = false;
    if (window === 'expired' && daysRemaining < 0) matches = true;
    else if (window === '2days' && daysRemaining >= 0 && daysRemaining <= 2) matches = true;
    else if (window === '10days' && daysRemaining >= 0 && daysRemaining <= 10) matches = true;
    else if (window === 'all') matches = true;

    if (matches) {
      results.push({
        passId,
        applicantName,
        applicantType,
        passType,
        documentType,
        expiryDate: dateStr,
        daysRemaining
      });
    }
  };

  // 1. Check Pass Applications
  const passSnapshot = await db().collection(PASS_COLLECTION).get();
  passSnapshot.forEach(doc => {
    const pass = { id: doc.id, ...doc.data() };
    if (pass.documents && Array.isArray(pass.documents)) {
      pass.documents.forEach(docItem => {
        checkAndAdd(docItem.expiryDate, pass.applicantName, pass.applicantType, pass.passType, docItem.type, pass.id);
      });
    }
  });

  // 2. Check Employee Master (collectionGroup allows querying across all organizations)
  const empSnapshot = await db().collectionGroup('employees').get();
  empSnapshot.forEach(doc => {
    const emp = { id: doc.id, ...doc.data() };
    // Only process if they have a name and aren't completely empty
    if (!emp.fullName) return;
    
    checkAndAdd(emp.passExpiryDate, emp.fullName, 'Employee', emp.passType || 'N/A', 'Final Pass Validity');
    checkAndAdd(emp.avsecExpiry, emp.fullName, 'Employee', emp.passType || 'N/A', 'AVSEC (Master)');
    checkAndAdd(emp.caExpiry, emp.fullName, 'Employee', emp.passType || 'N/A', 'C&A (Master)');
  });

  // Sort: most overdue first, then soonest to expire
  return results.sort((a, b) => a.daysRemaining - b.daysRemaining);
};

module.exports = {
  createPass,
  getPasses,
  getPassById,
  updatePassStatus,
  updatePassDocuments,
  cancelPass,
  deletePass,
  getExpiryReminders
};
