import { apiClient } from './client';
import {
  AvailableSlotsResponse,
  Doctor,
  DoctorProfile,
  DoctorSchedule,
  CreateSchedulePayload,
  UpdateSchedulePayload,
} from '@/types/doctor';
import { PaginationMeta } from '@/types/api';

export interface DoctorsListResponse {
  doctors: Doctor[];
  pagination: PaginationMeta;
}

export interface GetAllDoctorsParams {
  page?: number;
  limit?: number;
  name?: string;
  specialization?: string;
}

export const doctorApi = {
  getAllDoctors: async (params?: GetAllDoctorsParams): Promise<DoctorsListResponse> => {
    // Only pass non-empty trimmed parameters
    const cleanParams: Record<string, string | number> = {};
    if (params?.page) cleanParams.page = params.page;
    if (params?.limit) cleanParams.limit = params.limit;
    if (params?.name?.trim()) cleanParams.name = params.name.trim();
    if (params?.specialization && params.specialization !== 'ALL' && params.specialization.trim()) {
      cleanParams.specialization = params.specialization.trim();
    }

    const response = await apiClient.get<DoctorsListResponse>('/doctor/all', {
      params: cleanParams,
    });
    return response.data;
  },

  getDoctorById: async (doctorId: string): Promise<Doctor | null> => {
    // Backend returns verified doctors from /doctor/all. We look up by userId or profile id
    const res = await apiClient.get<DoctorsListResponse>('/doctor/all', {
      params: { limit: 50 },
    });
    const found = res.data.doctors.find(
      (d) => d.userId === doctorId || d.id === doctorId || d.user?.id === doctorId
    );
    return found || null;
  },

  getAvailableSlots: async (doctorId: string, date: string): Promise<AvailableSlotsResponse> => {
    const response = await apiClient.get<AvailableSlotsResponse>(
      `/doctor/${doctorId}/available-slots`,
      {
        params: { date },
      }
    );
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
      '/doctor/create-profile',
      profileData
    );
    return response.data;
  },

  getMySchedule: async (): Promise<{ schedules: DoctorSchedule[] }> => {
    const response = await apiClient.get<{ schedules: DoctorSchedule[] }>('/doctor/schedule');
    return response.data;
  },

  createSchedule: async (
    scheduleData: CreateSchedulePayload
  ): Promise<{ message: string; schedule: DoctorSchedule }> => {
    const response = await apiClient.post<{ message: string; schedule: DoctorSchedule }>(
      '/doctor/schedule',
      scheduleData
    );
    return response.data;
  },

  updateSchedule: async (
    scheduleId: string,
    scheduleData: UpdateSchedulePayload
  ): Promise<{ message: string; schedule: DoctorSchedule }> => {
    const response = await apiClient.put<{ message: string; schedule: DoctorSchedule }>(
      `/doctor/schedule/${scheduleId}`,
      scheduleData
    );
    return response.data;
  },

  deleteSchedule: async (scheduleId: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(
      `/doctor/schedule/${scheduleId}`
    );
    return response.data;
  },
};
