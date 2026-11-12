import api from '@/services/api';

export const calendarService = {
  getEvents: () => api.get('/calendar')
};
