export interface CreateAppointmentDto {
  customerId: string;
  companyId: string;
  serviceIds: string[];
  scheduledDate: string;
  scheduledHour: string;
}

export interface UpdateAppointmentDto extends Partial<CreateAppointmentDto> {}

export interface SearchAppointmentDto {
  companyId: string;
  startDate: Date;
  endDate: Date;
  serviceIds?: string[];
  status?: string;
}

export interface AvailabilityDto {
  companyId: string;
  serviceIds: string[];
  editingAppointmentId?: string;
}

export interface FinishAppointmentDto {
  serviceIds: string[];
  paymentType: string;
  discountType: string | null;
  discountValue: number | null;
  totalPaid: number;
}
