import api from '../../../services/api';

const AUDIT_URL = '/audit';

export const auditService = {
  getLogs: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`${AUDIT_URL}${params ? `?${params}` : ''}`);
    return response.data;
  }
};
