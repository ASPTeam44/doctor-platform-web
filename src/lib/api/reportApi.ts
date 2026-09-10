import { apiClient } from './client';
import {
  MedicalReport,
  DownloadUrlResponse,
  ReportAccess,
  GrantAccessPayload,
} from '@/types/report';

export const reportApi = {
  // Doctor: Get authorized patient medical reports for a patient
  getPatientReportsForDoctor: async (patientId: string): Promise<{ reports: MedicalReport[] }> => {
    const response = await apiClient.get<{ reports: MedicalReport[] }>(
      `/reports/patient/${patientId}`
    );
    return response.data;
  },

  // Doctor or Patient: Request temporary presigned download URL (valid 15 mins)
  getDownloadUrl: async (reportId: string): Promise<DownloadUrlResponse> => {
    const response = await apiClient.get<DownloadUrlResponse>(
      `/reports/${reportId}/download-url`
    );
    return response.data;
  },

  // Patient: View own medical reports
  getMyReports: async (): Promise<{ reports: MedicalReport[] }> => {
    const response = await apiClient.get<{ reports: MedicalReport[] }>('/reports/my-reports');
    return response.data;
  },

  // Patient: Grant doctor access to a medical report
  grantReportAccess: async (
    reportId: string,
    payload: GrantAccessPayload
  ): Promise<{ message: string; access: ReportAccess }> => {
    const response = await apiClient.post<{ message: string; access: ReportAccess }>(
      `/reports/${reportId}/access`,
      payload
    );
    return response.data;
  },

  // Patient: View access list for a report
  getReportAccessList: async (reportId: string): Promise<{ accesses: ReportAccess[] }> => {
    const response = await apiClient.get<{ accesses: ReportAccess[] }>(
      `/reports/${reportId}/access`
    );
    return response.data;
  },

  // Patient: Revoke doctor access to a report
  revokeReportAccess: async (
    reportId: string,
    accessId: string
  ): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(
      `/reports/${reportId}/access/${accessId}`
    );
    return response.data;
  },

  // Patient: Delete report
  deleteReport: async (reportId: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(`/reports/${reportId}`);
    return response.data;
  },
};
