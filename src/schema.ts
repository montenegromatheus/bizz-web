export interface User {
  id: string;
  name: string;
  email: string;
  active: boolean;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  birthDate: Date;
  isBlocked?: boolean;
  isInvalid: any;
}

export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
  description: string;
}

export interface Employee {
  id: string;
  name: string;
  companyId: string;
  active: boolean;
  company: Company;
  workWeeks: WorkWeek[];
}

export interface Company {
  id: string;
  name: string;
  phone: string;
  email: string;
  addressId: string;
  appointmentDays: number;
  appointmentInterval: number;
}

export interface WorkWeek {
  id: string;
  employeeId: string;
  employee: Employee;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

export interface Appointment {
  id: string;
  employeeId: string;
  customerId: string;
  scheduledDate: Date;
  status: string;
  updatedUserId: string;
  services?: AppointmentService[];
  discountType?: DiscountType;
  discountValue?: number;
  paymentType?: string;
  totalPaid?: number;
}

export interface AppointmentService {
  serviceId: string;
  appointmentId: string;
  paidAmount: number;
  service?: Service;
  appointment?: Appointment;
}

export interface IExtendedAppointment extends Appointment {
  duration: number;
  customer: Customer;
}

export interface BotParameters {
  lembrete_nodia: boolean;
  lembrete_anterior: boolean;
  permite_agendar: boolean;
  permite_remarcar: boolean;
  permite_cancelar: boolean;
  habilitar_fluxo: boolean;
  link_relatorio: string;
  endereco_atendimento: string;
  foto_company: string;
  orientacoes: string;
  bot_link: string;
  restricao: number;
}

export enum DiscountType {
  Valor = "Valor",
  Porcentagem = "Porcentagem",
}

export interface InvalidBlockNumber {
  id: string;
  phoneNumber: string;
  blockReason?: string;
  /** MANUAL | SYSTEM */
  blockSource: "MANUAL" | "SYSTEM";
  /** employeeId que fez o bloqueio */
  blockedBy: string;
  /** ISO date string ou Date, conforme você parseie */
  createdAt: string;
}
