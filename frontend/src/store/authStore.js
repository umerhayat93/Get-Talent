import { create } from 'zustand';

const STORAGE_KEY = 'gt_auth_v2';

function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { token: null, user: null };
    const data = JSON.parse(raw);
    if (data && typeof data.token === 'string' && data.user) {
      return { token: data.token, user: data.user };
    }
  } catch (e) {}
  return { token: null, user: null };
}

function writeStorage(token, user) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }));
  } catch (e) {}
}

function deleteStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    // Also clear any old keys from previous versions
    localStorage.removeItem('gt-auth');
    localStorage.removeItem('gt_auth');
  } catch (e) {}
}

// Read initial state SYNCHRONOUSLY at module load time
const init = readStorage();

export const useAuthStore = create((set, get) => ({
  token: init.token,
  user:  init.user,
  profile: null,

  setAuth(token, user) {
    writeStorage(token, user);
    set({ token, user });
  },

  setProfile(profile) {
    set({ profile });
  },

  logout() {
    deleteStorage();
    set({ token: null, user: null, profile: null });
  },

  isLoggedIn() { return !!get().token; },
  isAdmin()    { return get().user?.role === 'admin'; },
  isPlayer()   { return get().user?.role === 'player'; },
  isCaptain()  { return get().user?.role === 'captain'; },
}));

export { STORAGE_KEY };
