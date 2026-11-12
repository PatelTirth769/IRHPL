const { db } = require('../../config/firebase');
const ApiError = require('../../utils/ApiError');
const auditService = require('../audit/audit.service');

const CHECKLIST_COLLECTION = 'checklists';

const TEMPLATES = {
  'common': [
    { id: 'dial_signature_time', label: 'Ensure submission for DIAL Commercial sign-off is only processed after 12:00 PM' },
    { id: 'office_closure_time', label: 'Confirm submission was completed before 6:00 PM (DIAL/BCAS office closure)' }
  ],
  '4-hour': [
    { id: 'in_person_visit', label: 'Confirm applicant visited Pass Office in person to fill TAEP form (No remote communication)' },
    { id: 'pass_surrender', label: 'Physically collect and verify pass surrender copy if TAEP was applied earlier' }
  ],
  '1-3-day': [
    { id: 'in_person_visit', label: 'Confirm applicant visited Pass Office in person to fill TAEP form (No remote communication)' },
    { id: 'pass_surrender', label: 'Physically collect and verify pass surrender copy if TAEP was applied earlier' }
  ],
  'taep-fresh-30': [
    { id: 'ca_dispatch', label: 'Verify C&A form sent via Speed Post/Registered Post, OR hand-delivered to BCAS if Delhi address' },
    { id: 'ca_receipt', label: 'Confirm C&A Postal receipt was submitted to the Pass Office the very next day' }
  ],
  'taep-forwarding-60': [
    { id: 'avsec_followup', label: 'Confirm AVSEC training link received within 2-3 days (If not, log Pass Office visit for link regeneration)' },
    { id: 'past_docs_verified', label: 'Physically verify past Valid AVSEC, C&A & TAEP Receiving documents' }
  ],
  'baep': [
    { id: 'baep_receiving', label: 'Physically verify BAEP Receiving from past company (if 90 days TAEP consumed)' },
    { id: 'prereqs_completed', label: 'Confirm AVSEC and C&A formalities are fully completed before BAEP application' },
    { id: 'biometric', label: 'Confirm employee biometric processing (Thumb Impression) scheduled with DIAL' },
    { id: 'revert_resubmission', label: 'If file reverted, confirm documents resubmitted and TAT clock manually restarted' }
  ]
};

const generateChecklistForPass = async (passId, passData, orgId, userId) => {
  const items = [
    ...TEMPLATES['common'],
    ...(TEMPLATES[passData.passType] || [])
  ].map(t => ({
    id: t.id,
    label: t.label,
    checked: false,
    checkedAt: null,
    checkedBy: null
  }));

  const newChecklist = {
    passId,
    orgId,
    applicantName: passData.applicantName,
    passType: passData.passType,
    items,
    progress: 0,
    total: items.length,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const docRef = await db().collection(CHECKLIST_COLLECTION).add(newChecklist);
  return { id: docRef.id, ...newChecklist };
};

const getChecklists = async (orgId) => {
  let query = db().collection(CHECKLIST_COLLECTION);
  if (orgId) {
    query = query.where('orgId', '==', orgId);
  }
  const snapshot = await query.get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

const getChecklistByPassId = async (passId) => {
  const snapshot = await db().collection(CHECKLIST_COLLECTION).where('passId', '==', passId).get();
  if (snapshot.empty) {
    return null;
  }
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
};

const updateChecklistItem = async (checklistId, itemId, checked, userId) => {
  const docRef = db().collection(CHECKLIST_COLLECTION).doc(checklistId);
  const doc = await docRef.get();
  
  if (!doc.exists) {
    throw new ApiError(404, 'Checklist not found');
  }

  const data = doc.data();
  const items = data.items.map(item => {
    if (item.id === itemId) {
      return {
        ...item,
        checked,
        checkedAt: checked ? new Date().toISOString() : null,
        checkedBy: checked ? userId : null
      };
    }
    return item;
  });

  const progress = items.filter(i => i.checked).length;
  const updates = { items, progress, updatedAt: new Date().toISOString() };

  await docRef.update(updates);

  await auditService.logEvent({
    action: 'CHECKLIST_UPDATED',
    actorId: userId,
    targetId: data.passId,
    targetType: 'pass_application',
    description: `Checklist item '${itemId}' was ${checked ? 'checked' : 'unchecked'}`
  });

  return { id: doc.id, ...data, ...updates };
};

module.exports = {
  generateChecklistForPass,
  getChecklists,
  getChecklistByPassId,
  updateChecklistItem
};
