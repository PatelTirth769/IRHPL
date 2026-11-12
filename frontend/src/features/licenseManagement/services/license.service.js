import api from '../../../services/api';

const LM_URL = '/license-management';

export const licenseService = {
  // Generic Entity CRUD
  getCollection: async (collection) => {
    const response = await api.get(`${LM_URL}/${collection}`);
    return response.data;
  },
  createEntity: async (collection, data) => {
    const response = await api.post(`${LM_URL}/${collection}`, data);
    return response.data;
  },
  updateEntity: async (collection, id, data) => {
    const response = await api.patch(`${LM_URL}/${collection}/${id}`, data);
    return response.data;
  },
  deleteEntity: async (collection, id) => {
    const response = await api.delete(`${LM_URL}/${collection}/${id}`);
    return response.data;
  },

  // License Specific
  updateLicenseStatus: async (id, status, remarks = '') => {
    const response = await api.patch(`${LM_URL}/licenses/${id}/status`, { status, remarks });
    return response.data;
  },
  updateLicenseDocuments: async (id, documents) => {
    const response = await api.patch(`${LM_URL}/licenses/${id}/documents`, { documents });
    return response.data;
  },
  addLicenseModification: async (id, payload) => {
    // payload: { type, details, date, documents }
    const response = await api.post(`${LM_URL}/licenses/${id}/modifications`, payload);
    return response.data;
  }
};
