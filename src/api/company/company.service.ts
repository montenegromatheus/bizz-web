import { Company, Employee, Service } from "@/schema";
import { axios } from "../axios";
import { CreateAndLinkCustomerDto } from "./company.dto";
import { QueryDto } from "../query";

export async function findOne(id: string): Promise<Company> {
  return await axios.get(`/company/${id}`);
}

export async function update(
  id: string,
  data: Partial<Company>,
): Promise<Company> {
  return await axios.patch(`/company/${id}`, data);
}

export async function companyCustomers(
  companyId: string,
  params?: QueryDto,
): Promise<any> {
  return await axios.get(`/company/${companyId}/customer`, { params });
}

export async function companyServices(
  companyId: string,
  params?: QueryDto,
): Promise<Service[]> {
  return await axios.get(`/company/${companyId}/service`, { params });
}

export async function companyEmployees(
  companyId: string,
  params?: QueryDto,
): Promise<Employee[]> {
  return await axios.get(`/company/${companyId}/employee`, { params });
}

export async function createAndLinkCustomer(
  companyId: string,
  data: CreateAndLinkCustomerDto,
): Promise<any> {
  return await axios.post(`/company/${companyId}/customer/create`, data);
}

export async function unlinkCustomer(
  companyId: string,
  customerId: string,
): Promise<any> {
  return await axios.delete(`/company/${companyId}/customer/${customerId}`);
}

export async function monthReport(
  id: string,
  dto: { date: Date },
): Promise<any> {
  return await axios.post(`/company/${id}/month-report`, dto);
}
