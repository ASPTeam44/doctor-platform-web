import { apiClient } from "./client";
import { AuthResponse, RegisterResponse, User } from "@/types/auth";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: "PATIENT" | "DOCTOR" | "PHARMACY";
}

export const authApi = {
  login: async (credentials: LoginPayload): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("/auth/login", credentials);
    return response.data;
  },

  register: async (data: RegisterPayload): Promise<RegisterResponse> => {
    const response = await apiClient.post<RegisterResponse>("/auth/register", data);
    return response.data;
  },

  getProfile: async (): Promise<{ message: string; user: User }> => {
    const response = await apiClient.get<{ message: string; user: User }>("/user/profile");
    return response.data;
  },
};
