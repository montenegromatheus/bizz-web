import { User } from "@/schema";
import { axios } from "../axios";

import { LoginDto } from "./auth.dto";

export async function login(
  data: LoginDto,
): Promise<{ user: User; access_token: string }> {
  return await axios.post("/auth/login", data);
}
