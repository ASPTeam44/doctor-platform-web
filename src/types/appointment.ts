export type AppointmentStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentDate: string;
  symptoms?: string | null;
  status: AppointmentStatus;
  createdAt: string;
  updatedAt: string;
  doctor?: {
    id: string;
    name: string;
    email: string;
    doctorProfile?: {
      specialization: string;
      consultationFee: number;
      hospitalName?: string | null;
      timezone?: string;
    };
  };
  patient?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
}
