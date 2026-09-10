export type UploadStatus = 'PENDING' | 'UPLOADED' | 'FAILED';

export interface MedicalReport {
  id: string;
  patientId: string;
  title: string;
  reportType: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  reportDate: string;
  uploadStatus: UploadStatus;
  createdAt: string;
  updatedAt: string;
}

export interface DownloadUrlResponse {
  reportId: string;
  downloadUrl: string;
  expiresIn: number;
}

export interface ReportAccessDoctorRef {
  id: string;
  name: string;
  email: string;
}

export interface ReportAccess {
  id: string;
  reportId: string;
  doctorId: string;
  grantedByPatientId: string;
  appointmentId?: string | null;
  expiresAt?: string | null;
  revokedAt?: string | null;
  createdAt: string;
  doctor?: ReportAccessDoctorRef;
}

export interface GrantAccessPayload {
  doctorId: string;
  appointmentId?: string;
  expiresAt?: string;
}
