export type PrescriptionStatus = 'DRAFT' | 'ISSUED' | 'CANCELLED';

export interface PrescriptionItem {
  id?: string;
  prescriptionId?: string;
  medicineName: string;
  strength?: string | null;
  dosage: string;
  frequency: string;
  duration: number;
  durationUnit?: string;
  route?: string;
  instructions?: string | null;
  quantity: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PrescriptionDoctorRef {
  id: string;
  name: string;
  email: string;
  doctorProfile?: {
    specialization?: string;
    hospitalName?: string | null;
    qualification?: string;
  };
}

export interface PrescriptionPatientRef {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface PrescriptionAppointmentRef {
  id: string;
  appointmentDate: string;
  status: string;
}

export interface Prescription {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  diagnosis: string;
  clinicalNotes?: string | null;
  instructions?: string | null;
  status: PrescriptionStatus;
  createdAt: string;
  updatedAt: string;
  items: PrescriptionItem[];
  doctor?: PrescriptionDoctorRef;
  patient?: PrescriptionPatientRef;
  appointment?: PrescriptionAppointmentRef;
}

export interface CreatePrescriptionItemInput {
  medicineName: string;
  strength?: string;
  dosage: string;
  frequency: string;
  duration: number;
  durationUnit?: string;
  route?: string;
  instructions?: string;
  quantity: number;
}

export interface CreatePrescriptionPayload {
  appointmentId: string;
  diagnosis: string;
  clinicalNotes?: string;
  instructions?: string;
  status?: 'DRAFT' | 'ISSUED';
  items: CreatePrescriptionItemInput[];
}

export interface UpdatePrescriptionPayload {
  diagnosis?: string;
  clinicalNotes?: string;
  instructions?: string;
  items?: CreatePrescriptionItemInput[];
}
