import api from '@/services/api';

export const checklistService = {
  getChecklists: () => api.get('/checklists'),
  getChecklistByPassId: (passId) => api.get(`/checklists/pass/${passId}`),
  updateChecklistItem: (checklistId, itemId, checked) => api.patch(`/checklists/${checklistId}/items/${itemId}`, { checked })
};
