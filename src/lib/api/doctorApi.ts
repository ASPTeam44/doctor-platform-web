import { apiClient } from "./client";
import { AvailableSlotsResponse, DoctorProfile, DoctorUser } from "@/types/doctor";
import { PaginationMeta } from "@/types/api";

export interface DoctorsListResponse {
  doctors: DoctorUser[];
  pagination: PaginationMeta;
}

export const doctorApi = {
  getAllDoctors: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    specialization?: string;
  }): Promise<DoctorsListResponse> => {
    const response = await apiClient.get<DoctorsListResponse>("/doctor/all", { params });
    return response.data;
  },

  getAvailableSlots: async (doctorId: string, date: string): Promise<AvailableSlotsResponse> => {
    const response = await apiClient.get<AvailableSlotsResponse>(`/doctor/${doctorId}/available-slots`, {
      params: { date },
    });
    return response.data;
  },

  createProfile: async (profileData: {
    specialization: string;
    experience: number;
    consultationFee: number;
    qualification: string;
    hospitalName?: string;
    bio?: string;
    languages?: string;
    timezone?: string;
  }): Promise<{ message: string; doctorProfile: DoctorProfile }> => {
    const response = await apiClient.post<{ message: string; doctorProfile: DoctorProfile }>(
      "/doctor/create-profile",
      profileData
    );
    return response.data;
  },

  getMySchedule: async (): Promise<{ schedules: any[] }> => {
    const response = await apiClient.get<{ schedules: any[] }>("/doctor/schedule");
    return response.data;
  },
};
