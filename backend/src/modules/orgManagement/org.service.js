const { db } = require('../../config/firebase');
const { logEvent } = require('../audit/audit.service');

const C_COMPANIES = 'lm_companies';
const C_LOCATIONS = 'lm_locations';
const C_ZONES = 'lm_zones';
const C_STORES = 'lm_stores';

const createOrgChain = async (payload, userId) => {
  const { companyName, locationName, locationType, zoneName, zoneType, storeName, storeType, licenseType } = payload;
  
  let companyId, locationId, zoneId = null, storeId;
  const batch = db().batch();

  // 1. Company
  const companyRef = db().collection(C_COMPANIES).doc();
  companyId = companyRef.id;
  batch.set(companyRef, {
    name: companyName,
    createdAt: new Date().toISOString()
  });

  // 2. Location
  const locationRef = db().collection(C_LOCATIONS).doc();
  locationId = locationRef.id;
  batch.set(locationRef, {
    name: locationName,
    companyId,
    type: locationType,
    createdAt: new Date().toISOString()
  });

  // 3. Zone (only if Airport)
  if (locationType === 'Airport' && zoneName) {
    const zoneRef = db().collection(C_ZONES).doc();
    zoneId = zoneRef.id;
    batch.set(zoneRef, {
      name: zoneName,
      locationId,
      type: zoneType,
      createdAt: new Date().toISOString()
    });
  }

  // 4. Store
  const storeRef = db().collection(C_STORES).doc();
  storeId = storeRef.id;
  batch.set(storeRef, {
    name: storeName,
    zoneId: zoneId || locationId,
    storeType,
    licenseType: licenseType || null,
    createdAt: new Date().toISOString()
  });

  // 5. License (Draft)
  let licenseId = null;
  if (licenseType) {
    const C_LICENSES = 'lm_licenses';
    const licenseRef = db().collection(C_LICENSES).doc();
    licenseId = licenseRef.id;
    batch.set(licenseRef, {
      licenseType: licenseType,
      linkedStore: storeId,
      govBody: payload.govBody || '',
      status: 'Issued/Active',
      phase: 'Phase 1', // Default
      validityStartDate: payload.validityStartDate || null,
      validityEndDate: payload.validityEndDate || null,
      renewalDueDate: payload.renewalDueDate || null,
      informationRequired: payload.informationRequired || {},
      documentsRequired: payload.documentsRequired || [],
      licenseCopy: payload.licenseCopy || null,
      statusHistory: [{
        status: 'Issued/Active',
        date: new Date().toISOString(),
        remarks: 'Auto-activated from Org Chain creation',
        updatedBy: userId
      }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  await batch.commit();

  await logEvent({
    action: 'ORG_CHAIN_CREATED',
    targetId: companyId,
    targetType: 'ORG_CHAIN',
    description: `Org chain created: ${companyName} -> ${storeName}`,
    actorId: userId
  });

  return { companyId, locationId, zoneId, storeId };
};

const getOrgChains = async () => {
  // Fetch all to compose the chain
  const [compSnap, locSnap, zoneSnap, storeSnap] = await Promise.all([
    db().collection(C_COMPANIES).get(),
    db().collection(C_LOCATIONS).get(),
    db().collection(C_ZONES).get(),
    db().collection(C_STORES).get()
  ]);

  const companies = compSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const locations = locSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const zones = zoneSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const stores = storeSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  const chains = [];

  stores.forEach(store => {
    // Find zone
    const zone = zones.find(z => z.id === store.zoneId);
    let loc = null;
    if (zone) {
      loc = locations.find(l => l.id === zone.locationId);
    } else {
      // maybe linked directly to location
      loc = locations.find(l => l.id === store.zoneId);
    }
    const comp = loc ? companies.find(c => c.id === loc.companyId) : null;

    if (comp && loc) {
      chains.push({
        id: store.id, // using store as the leaf node for the chain
        company: comp,
        location: loc,
        zone: zone || null,
        store: store
      });
    }
  });

  // Also push companies/locations that have no stores yet, but the requirement is full chain, so focusing on chains for now.
  return chains;
};

const deleteOrgChain = async (storeId, userId) => {
  // To keep it simple and safe, we just delete the store for now, as deleting the whole chain might orphan other branches.
  await db().collection(C_STORES).doc(storeId).delete();
  
  await logEvent({
    action: 'ORG_CHAIN_DELETED',
    targetId: storeId,
    targetType: 'ORG_CHAIN',
    description: `Store ${storeId} deleted from org chain`,
    actorId: userId
  });
};

module.exports = {
  createOrgChain,
  getOrgChains,
  deleteOrgChain
};
