require('dotenv').config();
const { db } = require('./src/config/firebase');

async function test() {
  const empSnapshot = await db().collectionGroup('employees').get();
  console.log(`Found ${empSnapshot.size} employees in collectionGroup`);
  empSnapshot.forEach(doc => {
    const data = doc.data();
    console.log(doc.id, data.fullName, data.passExpiry, data.avsecExpiry, data.caExpiry);
  });
}

test().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
