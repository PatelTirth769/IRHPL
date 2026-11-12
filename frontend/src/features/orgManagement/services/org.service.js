import api from '../../../services/api';

const ORG_URL = '/org-management';

export const orgService = {
  getOrgChains: async () => {
    const response = await api.get(`${ORG_URL}/chains`);
    return response.data;
  },
  createOrgChain: async (data) => {
    const response = await api.post(`${ORG_URL}/chains`, data);
    return response.data;
  },
  deleteOrgChain: async (id) => {
    const response = await api.delete(`${ORG_URL}/chains/${id}`);
    return response.data;
  }
};
