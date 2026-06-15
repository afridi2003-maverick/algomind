import { create } from 'zustand';

export interface User {
  id: string;
  name: string;
  email: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

/**
 * Generate or retrieve a persistent student identity from localStorage.
 * Each browser/device gets a unique student ID on first visit.
 */
function getOrCreateUser(): User {
  if (typeof window === 'undefined') {
    // SSR fallback
    return { id: 'student_ssr', name: 'Student', email: 'student@algomind.app' };
  }
  
  try {
    const stored = localStorage.getItem('algomind_user');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.id && parsed.name && parsed.email) {
        return parsed;
      }
    }
  } catch { /* corrupt localStorage, regenerate */ }
  
  // Generate a new unique identity
  const uuid = crypto.randomUUID();
  const shortId = uuid.slice(0, 8);
  const newUser: User = {
    id: `student_${shortId}`,
    name: 'Student',
    email: `student_${shortId}@algomind.app`
  };
  
  try {
    localStorage.setItem('algomind_user', JSON.stringify(newUser));
  } catch { /* localStorage not available */ }
  
  return newUser;
}

interface UserState {
  user: User | null;
  startedAlgorithms: string[];
  masteredAlgorithms: string[];
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  login: (email: string, name: string) => Promise<void>;
  logout: () => void;
  trackAlgorithmStart: (algo: string) => Promise<void>;
  trackAlgorithmMastered: (algo: string) => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  // Generate unique user per browser on first visit
  user: getOrCreateUser(),
  startedAlgorithms: [],
  masteredAlgorithms: [],
  isLoading: false,
  error: null,
  
  setUser: (user) => {
    set({ user });
    if (user && typeof window !== 'undefined') {
      try {
        localStorage.setItem('algomind_user', JSON.stringify(user));
      } catch { /* localStorage not available */ }
    }
  },
  
  login: async (email: string, name: string) => {
    set({ isLoading: true, error: null });
    try {
      const uuid = crypto.randomUUID();
      const shortId = uuid.slice(0, 8);
      const newUser: User = {
        id: `student_${shortId}`,
        name,
        email,
      };
      
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('algomind_user', JSON.stringify(newUser));
        } catch { /* localStorage not available */ }
      }
      
      set({
        user: newUser,
        startedAlgorithms: [],
        masteredAlgorithms: [],
        isLoading: false
      });
    } catch (err: any) {
      set({ error: err.message || 'Login failed', isLoading: false });
    }
  },
  
  logout: () => {
    if (typeof window !== 'undefined') {
      try { localStorage.removeItem('algomind_user'); } catch { /* */ }
    }
    set({ user: null, startedAlgorithms: [], masteredAlgorithms: [], error: null });
  },
  
  trackAlgorithmStart: async (algo: string) => {
    const { startedAlgorithms, user } = get();
    if (!startedAlgorithms.includes(algo)) {
      const updated = [...startedAlgorithms, algo];
      set({ startedAlgorithms: updated });
      
      // Sync to backend DB if logged in
      if (user) {
        try {
          await fetch(`${API_URL}/api/student/progress`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              student_id: user.id,
              algorithms_started: updated
            })
          });
        } catch (e) {
          console.warn('Could not sync progress to backend:', e);
        }
      }
    }
  },
  
  trackAlgorithmMastered: async (algo: string) => {
    const { masteredAlgorithms, user } = get();
    if (!masteredAlgorithms.includes(algo)) {
      const updated = [...masteredAlgorithms, algo];
      set({ masteredAlgorithms: updated });
      
      // Sync to backend DB if logged in
      if (user) {
        try {
          await fetch(`${API_URL}/api/student/progress`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              student_id: user.id,
              algorithms_mastered: updated
            })
          });
        } catch (e) {
          console.warn('Could not sync mastered status to backend:', e);
        }
      }
    }
  }
}));
