import { QueryDto } from "@/api/query";
import { axios } from "../../axios";
import { UserCreateDto, UserUpdateDto } from "./user.dto";
import { User } from "@/schema";

export async function getAll(params?: QueryDto): Promise<User[]> {
  return await axios.get("/v1/users", {
    params,
  });
}

export async function get(id: string): Promise<User> {
  return await axios.get(`/v1/users/${id}`);
}

export async function create(data: UserCreateDto) {
  return await axios.post("/v1/users", data);
}

export async function update(id: string, data: UserUpdateDto) {
  return await axios.put(`/v1/users/${id}`, data);
}

export async function remove(id: string) {
  return await axios.delete(`/v1/users/${id}`);
}

export async function me(): Promise<{ user: User; companyId: string }> {
  return await axios.get("/user-system/me");
}
