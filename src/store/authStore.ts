import { create } from 'zustand';

interface UserProfile {
  id: string;
  nickname: string;
  age: number;
  gender: 'M' | 'F';
  height: number;
  weight: number;
  activityLevel: 'low' | 'normal' | 'high';
  allergies: string[];
  diseases: string[];
  dietStyle: 'vegetarian' | 'normal' | 'keto';
  preferredIngredients: string[];
  dietGoal: 'lose' | 'maintain' | 'gain';
  tdee: number;
}

interface AuthState {
  isLoggedIn: boolean;
  isOnboarded: boolean;
  user: UserProfile | null;
  setUser: (user: UserProfile) => void;
  setLoggedIn: (v: boolean) => void;
  setOnboarded: (v: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  isOnboarded: false,
  user: null,
  setUser: (user) => set({ user }),
  setLoggedIn: (isLoggedIn) => set({ isLoggedIn }),
  setOnboarded: (isOnboarded) => set({ isOnboarded }),
  logout: () => set({ isLoggedIn: false, isOnboarded: false, user: null }),
}));
