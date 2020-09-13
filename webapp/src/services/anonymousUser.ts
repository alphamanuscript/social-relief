const TOKEN_KEY = 'anonymousUser';

export const AnonymousUser = {
  isSet () {
    const token = localStorage.getItem(TOKEN_KEY);
    return !!token;
  },
  getUserData() {
    try {
      const userData = localStorage.getItem(TOKEN_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch(e) { console.error(e.message); } // eslint-disable-line
  },
  setUserData(userData: { _id: string }) {
    try {
      localStorage.setItem(TOKEN_KEY, JSON.stringify(userData));
    }
    catch(e) { console.error(e.message); } // eslint-disable-line
  },
  deleteUserData() {
    localStorage.removeItem(TOKEN_KEY);
  }
}