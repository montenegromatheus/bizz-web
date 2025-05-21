import { Appointment, IExtendedAppointment } from "@/schema";
import { axios } from "../axios";
import {
  AvailabilityDto,
  CreateAppointmentDto,
  FinishAppointmentDto,
  SearchAppointmentDto,
  UpdateAppointmentDto,
} from "./appointment.dto";

export async function create(data: CreateAppointmentDto): Promise<Appointment> {
  return await axios.post("appointment", data);
}

export async function update(
  appointmentId: string,
  data: UpdateAppointmentDto,
): Promise<Appointment> {
  return await axios.patch(`appointment/${appointmentId}`, data);
}
export async function search(
  data: SearchAppointmentDto,
): Promise<IExtendedAppointment[]> {
  return await axios.post("appointment/search", data);
}

export async function availability(data: AvailabilityDto): Promise<any[]> {
  return await axios.post("appointment/availability", data);
}

export async function cancel(id: string): Promise<any> {
  return await axios.put(`appointment/${id}/cancel`);
}

export async function done(id: string, data: FinishAppointmentDto) {
  return axios.put(`appointment/${id}/done`, data);
}
