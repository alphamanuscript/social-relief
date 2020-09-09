const TOKEN_KEY = 'anonymous';

export const Anonymous = {
  isSet () {
    const token = localStorage.getItem(TOKEN_KEY);
    return !!token;
  },
  getUserData() {
    return localStorage.getItem(TOKEN_KEY);
  },
  setUserData(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },
  deleteUserData() {
    localStorage.removeItem(TOKEN_KEY);
  }
}