import { db, storage } from '@/config/firebase';
import { collection, doc, addDoc, updateDoc, deleteDoc, getDoc, getDocs, query, orderBy, serverTimestamp, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

export const getEmployees = async (orgId) => {
  if (!orgId) return [];
  const empRef = collection(db, 'organizations', orgId, 'employees');
  const q = query(empRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getEmployee = async (orgId, employeeId) => {
  const docRef = doc(db, 'organizations', orgId, 'employees', employeeId);
  const snap = await getDoc(docRef);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const addEmployee = async (orgId, employeeData) => {
  const empRef = collection(db, 'organizations', orgId, 'employees');
  const docRef = await addDoc(empRef, {
    ...employeeData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  
  // Create an activity log
  await addDoc(collection(db, 'organizations', orgId, 'employees', docRef.id, 'activityLog'), {
    action: 'CREATED',
    timestamp: serverTimestamp()
  });
  
  return docRef.id;
};

export const updateEmployee = async (orgId, employeeId, employeeData) => {
  const docRef = doc(db, 'organizations', orgId, 'employees', employeeId);
  await updateDoc(docRef, {
    ...employeeData,
    updatedAt: serverTimestamp(),
  });
  
  await addDoc(collection(db, 'organizations', orgId, 'employees', employeeId, 'activityLog'), {
    action: 'UPDATED',
    timestamp: serverTimestamp()
  });
};

export const deleteEmployee = async (orgId, employeeId) => {
  const docRef = doc(db, 'organizations', orgId, 'employees', employeeId);
  await deleteDoc(docRef);
};

// Masking utility
export const maskSensitiveDoc = (value) => {
  if (!value) return '';
  const str = String(value).trim();
  if (str.length <= 4) return str;
  return `XXXX-XXXX-${str.slice(-4)}`;
};

// Full sensitive docs
export const saveSensitiveDoc = async (orgId, employeeId, docType, fullValue) => {
  const ref = doc(db, 'organizations', orgId, 'employees', employeeId, 'sensitiveDocs', docType);
  await setDoc(ref, {
    type: docType,
    value: fullValue,
    updatedAt: serverTimestamp()
  });
};

import { storageService } from '@/services/storage.service';

export const uploadEmployeeFile = async (orgId, employeeId, file, folderName) => {
  if (!file) return null;
  const folderPath = `organizations/${orgId}/employees/${employeeId}/${folderName}`;
  return await storageService.uploadFile(file, folderPath);
};
