export const setTokens = (tokens) => {
  if (tokens?.access?.token) {
    localStorage.setItem('accessToken', tokens.access.token);
  }
  if (tokens?.refresh?.token) {
    localStorage.setItem('refreshToken', tokens.refresh.token);
  }
};

export const getAccessToken = () => localStorage.getItem('accessToken');
export const getRefreshToken = () => localStorage.getItem('refreshToken');

export const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};
