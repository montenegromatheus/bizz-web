import { Employee } from "@/schema";
import { axios } from "../axios";
import { UpdateWorkWeeksDto } from "./employee.dto";

export async function findOne(id: string): Promise<Employee> {
  return await axios.get(`employee/${id}`);
}

export async function updateWorkWeeks(
  id: string,
  dto: UpdateWorkWeeksDto,
): Promise<Employee> {
  return await axios.put(`employee/${id}/work-week`, dto);
}
