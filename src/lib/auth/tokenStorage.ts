import { User } from "@/types/auth";

const TOKEN_KEY = "doctalk_token";
const USER_KEY = "doctalk_user";

export const tokenStorage = {
  getToken: (): string | null => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  setToken: (token: string): void => {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch (e) {
      console.error("Failed to persist token to storage", e);
    }
  },

  getUser: (): User | null => {
    try {
      const userJson = localStorage.getItem(USER_KEY);
      return userJson ? (JSON.parse(userJson) as User) : null;
    } catch {
      return null;
    }
  },

  setUser: (user: User): void => {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (e) {
      console.error("Failed to persist user to storage", e);
    }
  },

  clearAuth: (): void => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch (e) {
      console.error("Failed to clear auth from storage", e);
    }
  },
};
