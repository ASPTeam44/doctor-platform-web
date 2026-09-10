export type Role = "PATIENT" | "DOCTOR" | "PHARMACY" | "ADMIN";
export type UserRole = Role;

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  createdAt?: string;
  doctorProfile?: {
    id?: string;
    specialization: string;
    hospitalName?: string | null;
    verified: boolean;
    timezone?: string;
  };
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface RegisterResponse {
  message: string;
  user: User;
}
