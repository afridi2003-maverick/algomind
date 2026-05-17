import { create } from 'zustand';

export interface User {
  id: string;
  name: string;
  email: string;
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
  // Default mock user to ensure high-quality first-impression experience
  user: {
    id: 'student_1',
    name: 'Alex Turing',
    email: 'alex@university.edu'
  },
  startedAlgorithms: ['BFS', 'Dijkstra'],
  masteredAlgorithms: [],
  isLoading: false,
  error: null,
  
  setUser: (user) => set({ user }),
  
  login: async (email: string, name: string) => {
    set({ isLoading: true, error: null });
    try {
      // Setup a simulated API call to register/login on the backend if needed
      const simulatedUser: User = {
        id: `student_${Math.random().toString(36).substr(2, 9)}`,
        name,
        email,
      };
      set({
        user: simulatedUser,
        startedAlgorithms: [],
        masteredAlgorithms: [],
        isLoading: false
      });
    } catch (err: any) {
      set({ error: err.message || 'Login failed', isLoading: false });
    }
  },
  
  logout: () => {
    set({ user: null, startedAlgorithms: [], masteredAlgorithms: [], error: null });
  },
  
  trackAlgorithmStart: async (algo: string) => {
    const { startedAlgorithms, user } = get();
    if (!startedAlgorithms.includes(algo)) {
      const updated = [...startedAlgorithms, algo];
      set({ startedAlgorithms: updated });
      
      // Optionally sync to backend DB if logged in
      if (user) {
        try {
          await fetch('http://127.0.0.1:8000/api/student/progress', {
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
      
      // Optionally sync to backend DB if logged in
      if (user) {
        try {
          await fetch('http://127.0.0.1:8000/api/student/progress', {
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
