export interface DoctorProfile {
  id: string;
  userId: string;
  specialization: string;
  experience: number;
  consultationFee: number;
  qualification: string;
  hospitalName?: string | null;
  bio?: string | null;
  languages?: string | null;
  verified: boolean;
  profileImage?: string | null;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

export interface DoctorUser {
  id: string;
  name: string;
  email: string;
  doctorProfile?: DoctorProfile;
}

export interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
}

export interface AvailableSlotsResponse {
  doctorId: string;
  date: string;
  dayOfWeek: string;
  timezone: string;
  slots: TimeSlot[];
}
