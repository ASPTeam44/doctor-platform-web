import { apiClient } from "./client";
import { Appointment, AppointmentStatus } from "@/types/appointment";

export const appointmentApi = {
  getPatientAppointments: async (): Promise<{ appointments: Appointment[] }> => {
    const response = await apiClient.get<{ appointments: Appointment[] }>("/appointment/my-appointments");
    return response.data;
  },

  getDoctorAppointments: async (): Promise<{ appointments: Appointment[] }> => {
    const response = await apiClient.get<{ appointments: Appointment[] }>("/appointment/doctor-appointments");
    return response.data;
  },

  bookAppointment: async (payload: {
    doctorId: string;
    appointmentDate: string;
    symptoms?: string;
  }): Promise<{ message: string; appointment: Appointment }> => {
    const response = await apiClient.post<{ message: string; appointment: Appointment }>("/appointment/book", payload);
    return response.data;
  },

  updateStatus: async (
    appointmentId: string,
    status: AppointmentStatus
  ): Promise<{ message: string; appointment: Appointment }> => {
    const response = await apiClient.put<{ message: string; appointment: Appointment }>(
      `/appointment/update-status/${appointmentId}`,
      { status }
    );
    return response.data;
  },
};
