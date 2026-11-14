import api from '../../../services/api';

const AUDIT_URL = '/audit';

export const auditService = {
  getLogs: async (filters = {}) => {
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    );
    const params = new URLSearchParams(cleanFilters).toString();
    const response = await api.get(`${AUDIT_URL}${params ? `?${params}` : ''}`);
    return response.data;
  }
};
