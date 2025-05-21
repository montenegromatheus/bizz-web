import { axios } from "../../axios";

import {
  type ProfileDeletedDto,
  type ProfilePasswordDto,
  type ProfileUpdateDto,
} from "./profile.dto";
import { type User } from "@/schema";

export async function get(): Promise<User> {
  return await axios.get("/v1/profiles");
}

export async function changePassword(data: ProfilePasswordDto) {
  return await axios.patch("/v1/profiles/password", {
    password: data.password,
    oldPassword: data.oldPassword,
  });
}

export async function update(data: ProfileUpdateDto): Promise<User> {
  return await axios.put("/v1/profiles", {
    name: data.name,
    email: data.email,
  });
}

export async function changeAvatar(data: FormData) {
  return await axios.patch("/v1/profiles/avatar", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

export async function changeBanner(data: FormData) {
  return await axios.patch("/v1/profiles/banner", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

export async function deleteAccount(data: ProfileDeletedDto) {
  return await axios.delete("/v1/profiles", { data });
}
