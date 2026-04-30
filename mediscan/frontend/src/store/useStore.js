import { create } from 'zustand';

const useStore = create((set) => ({
  user: null,
  token: localStorage.getItem('ms_token') || null,
  profile: null,
  currentScan: null,

  setUser: (user) => set({ user }),
  setToken: (token) => {
    localStorage.setItem('ms_token', token);
    set({ token });
  },
  setProfile: (profile) => set({ profile }),
  setCurrentScan: (scan) => set({ currentScan: scan }),
  logout: () => {
    localStorage.removeItem('ms_token');
    set({ user: null, token: null, profile: null, currentScan: null });
  },
}));

export default useStore;
