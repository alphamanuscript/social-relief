const TOKEN_KEY = 'lockdown';

export const Auth = {
  isAuthenticated () {
    const token = localStorage.getItem(TOKEN_KEY);
    return !!token;
  },

  getAccessToken () {
    return localStorage.getItem(TOKEN_KEY);
  },

  setAccessToken (token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  deleteAccessToken () {
    localStorage.removeItem(TOKEN_KEY);
  }
};