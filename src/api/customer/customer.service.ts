import { InvalidBlockNumber } from "@/schema";
import { axios } from "../axios";
import { QueryDto } from "../query";
import { CustomerCreateDto, CustomerUpdateDto } from "./customer.dto";

export async function getAll(params?: QueryDto): Promise<any[]> {
  return await axios.get("/customer", {
    params,
  });
}

export async function get(id: string): Promise<any> {
  return await axios.get(`/customer/${id}`);
}

export async function create(data: CustomerCreateDto) {
  return await axios.post("/customer", data);
}

export async function update(id: string, data: CustomerUpdateDto) {
  return await axios.patch(`/customer/${id}`, data);
}

/**
 * Bloqueia um número para o funcionário passado em blockedBy.
 */
export async function blockCustomer({
  phone,
  reason,
  blockedBy,
}: {
  phone: string;
  reason: string;
  blockedBy: string;
}): Promise<InvalidBlockNumber> {
  const res = await axios.post<InvalidBlockNumber>("/invalid-block-numbers", {
    phoneNumber: phone,
    blockReason: reason,
    blockSource: "MANUAL",
    blockedBy,
  });
  return res.data;
}
/**
 * Desbloqueia um número para o funcionário passado em blockedBy.
 */
export async function unblockCustomer({
  phone,
  blockedBy,
}: {
  phone: string;
  blockedBy: string;
}): Promise<{ phoneNumber: string }> {
  const res = await axios.delete<{ phoneNumber: string }>(
    `/invalid-block-numbers/${phone}`,
    { data: { blockedBy } },
  );
  return res.data;
}
