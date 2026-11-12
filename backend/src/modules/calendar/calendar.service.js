const { db } = require('../../config/firebase');

const getCalendarEvents = async (orgId) => {
  const events = [];

  // 1. Fetch Passes
  let passesQuery = db().collection('passes');
  if (orgId) passesQuery = passesQuery.where('orgId', '==', orgId);
  const passesSnapshot = await passesQuery.get();
  
  passesSnapshot.docs.forEach(doc => {
    const pass = { id: doc.id, ...doc.data() };
    
    // Pass Completion Deadline
    if (pass.expectedCompletionDate && pass.status !== 'issued' && pass.status !== 'cancelled') {
      events.push({
        id: `pass-tat-${pass.id}`,
        title: `TAT Deadline: ${pass.applicantName}`,
        date: pass.expectedCompletionDate.split('T')[0],
        type: 'pass_deadline',
        link: `/dashboard/pass-management/${pass.id}`
      });
    }

    // Pass Due Date (e.g., C&A Postal Receipt)
    if (pass.dueDate && pass.status !== 'issued' && pass.status !== 'cancelled') {
      events.push({
        id: `pass-due-${pass.id}`,
        title: `Action Due: ${pass.applicantName}`,
        date: pass.dueDate.split('T')[0],
        type: 'pass_deadline',
        link: `/dashboard/pass-management/${pass.id}`
      });
    }

    // Document Expiries
    if (pass.documents && Array.isArray(pass.documents)) {
      pass.documents.forEach((d, idx) => {
        if (d.expiryDate) {
          events.push({
            id: `pass-doc-${pass.id}-${idx}`,
            title: `Expiring: ${d.type} (${pass.applicantName})`,
            date: d.expiryDate.split('T')[0],
            type: 'expiry',
            link: `/dashboard/pass-management/${pass.id}`
          });
        }
      });
    }
  });

  // 2. Fetch Licenses
  let licensesQuery = db().collection('lm_licenses');
  // Assuming licenses might not have orgId directly mapped yet, but if they do:
  // if (orgId) licensesQuery = licensesQuery.where('orgId', '==', orgId);
  const licensesSnapshot = await licensesQuery.get();
  
  licensesSnapshot.docs.forEach(doc => {
    const license = { id: doc.id, ...doc.data() };
    
    if (license.validityEndDate && license.status !== 'Cancelled') {
      events.push({
        id: `license-exp-${license.id}`,
        title: `License Expiry: ${license.name || license.licenseType}`,
        date: license.validityEndDate.split('T')[0],
        type: 'license_expiry',
        link: `/dashboard/license-management/${license.id}`
      });
    }

    if (license.renewalDueDate && license.status !== 'Cancelled') {
      events.push({
        id: `license-ren-${license.id}`,
        title: `Renewal Due: ${license.name || license.licenseType}`,
        date: license.renewalDueDate.split('T')[0],
        type: 'license_renewal',
        link: `/dashboard/license-management/${license.id}`
      });
    }
  });

  return events;
};

module.exports = {
  getCalendarEvents
};
