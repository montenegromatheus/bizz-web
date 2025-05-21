import { Service } from "@/schema";
import { axios } from "../axios";
import { CreateServiceDto, UpdateServiceDto } from "./service.dto";

export async function create(data: CreateServiceDto): Promise<Service> {
  return await axios.post("service", data);
}

export async function update(
  id: string,
  data: UpdateServiceDto,
): Promise<Service> {
  return await axios.patch(`service/${id}`, data);
}

export async function deleteService(serviceId: string): Promise<Service> {
  return await axios.delete(`service/${serviceId}`);
}
