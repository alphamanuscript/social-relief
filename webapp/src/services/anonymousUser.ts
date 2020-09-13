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
    } catch(e) {
      console.log(e.message);
    }
  },
  setUserData(userData: { _id: string }) {
    try {
      localStorage.setItem(TOKEN_KEY, JSON.stringify(userData));
    }
    catch(e) {
      console.error(e.message);
    }
  },
  deleteUserData() {
    localStorage.removeItem(TOKEN_KEY);
  }
}