import api from '../../../services/api';

const PASS_URL = '/passes';

export const passService = {
  getPasses: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`${PASS_URL}${params ? `?${params}` : ''}`);
    return response.data;
  },

  getPassById: async (id) => {
    const response = await api.get(`${PASS_URL}/${id}`);
    return response.data;
  },

  createPass: async (passData) => {
    const response = await api.post(PASS_URL, passData);
    return response.data;
  },

  updatePassStatus: async (id, status, remarks = '') => {
    const response = await api.patch(`${PASS_URL}/${id}/status`, { status, remarks });
    return response.data;
  },

  cancelPass: async (id, reason, date) => {
    const response = await api.patch(`${PASS_URL}/${id}/cancel`, { reason, date });
    return response.data;
  },
  
  updatePassDocuments: async (id, documents) => {
    const response = await api.patch(`${PASS_URL}/${id}/documents`, { documents });
    return response.data;
  },

  deletePass: async (id) => {
    const response = await api.delete(`${PASS_URL}/${id}`);
    return response.data;
  },

  getExpiryReminders: async (window = 'all') => {
    const response = await api.get(`${PASS_URL}/reminders/expiry`, { params: { window } });
    return response.data;
  }
};
