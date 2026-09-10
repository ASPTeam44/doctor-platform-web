export interface DoctorUserRef {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

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
  user?: DoctorUserRef;
}

export type Doctor = DoctorProfile;

export interface DoctorUser {
  id: string;
  name: string;
  email: string;
  doctorProfile?: DoctorProfile;
}

export interface TimeSlot {
  start: string; // "HH:mm" in 24h format (UTC)
  end: string;   // "HH:mm" in 24h format (UTC)
  available: boolean;
}

export interface AvailableSlotsResponse {
  doctorId: string;
  date: string;
  dayOfWeek: string;
  timezone: string;
  slots: TimeSlot[];
}

export type DayOfWeek =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY';

export interface DoctorSchedule {
  id: string;
  doctorId: string;
  dayOfWeek: DayOfWeek;
  startTime: string; // "HH:mm" in 24h format
  endTime: string;   // "HH:mm" in 24h format
  slotDuration: number; // minutes (10 - 120, default 30)
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSchedulePayload {
  dayOfWeek: DayOfWeek | string;
  startTime: string;
  endTime: string;
  slotDuration?: number;
  active?: boolean;
}

export interface UpdateSchedulePayload {
  dayOfWeek?: DayOfWeek | string;
  startTime?: string;
  endTime?: string;
  slotDuration?: number;
  active?: boolean;
}
