import { apiClient } from './client';
import {
  Prescription,
  CreatePrescriptionPayload,
  UpdatePrescriptionPayload,
} from '@/types/prescription';

export const prescriptionApi = {
  // Doctor: List authored prescriptions (with optional status filter)
  getDoctorPrescriptions: async (status?: string): Promise<{ prescriptions: Prescription[] }> => {
    const params: Record<string, string> = {};
    if (status && status !== 'ALL') {
      params.status = status;
    }
    const response = await apiClient.get<{ prescriptions: Prescription[] }>('/prescriptions/doctor', {
      params,
    });
    return response.data;
  },

  // Patient: List released prescriptions (ISSUED or CANCELLED, no DRAFTs)
  getMyPrescriptions: async (): Promise<{ prescriptions: Prescription[] }> => {
    const response = await apiClient.get<{ prescriptions: Prescription[] }>(
      '/prescriptions/my-prescriptions'
    );
    return response.data;
  },

  // Doctor or Patient: View single prescription by ID
  getPrescriptionById: async (id: string): Promise<{ prescription: Prescription }> => {
    const response = await apiClient.get<{ prescription: Prescription }>(`/prescriptions/${id}`);
    return response.data;
  },

  // Doctor: Create new prescription (DRAFT or ISSUED)
  createPrescription: async (
    payload: CreatePrescriptionPayload
  ): Promise<{ message: string; prescription: Prescription }> => {
    const response = await apiClient.post<{ message: string; prescription: Prescription }>(
      '/prescriptions',
      payload
    );
    return response.data;
  },

  // Doctor: Update DRAFT prescription
  updatePrescription: async (
    id: string,
    payload: UpdatePrescriptionPayload
  ): Promise<{ message: string; prescription: Prescription }> => {
    const response = await apiClient.put<{ message: string; prescription: Prescription }>(
      `/prescriptions/${id}`,
      payload
    );
    return response.data;
  },

  // Doctor: Finalize and issue DRAFT prescription
  issuePrescription: async (
    id: string
  ): Promise<{ message: string; prescription: Prescription }> => {
    const response = await apiClient.post<{ message: string; prescription: Prescription }>(
      `/prescriptions/${id}/issue`
    );
    return response.data;
  },

  // Doctor: Cancel prescription
  cancelPrescription: async (
    id: string
  ): Promise<{ message: string; prescription: Prescription }> => {
    const response = await apiClient.post<{ message: string; prescription: Prescription }>(
      `/prescriptions/${id}/cancel`
    );
    return response.data;
  },
};
