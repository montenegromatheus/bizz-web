import { axios } from "../../axios";

import {
  type SessionAccessFirstDto,
  type SessionCreateDto,
  type SessionCreateResponse,
  type SessionAccessTokenDto,
  type SessionForgotPasswordDto,
  type SessionResetPasswordDto,
  SessionFirstAccessTokenDto,
  SessionFirstAccessTokenResponseDto,
  SessionLicenseControlDto,
} from "./session.dto";

export async function accessFirst(data: SessionAccessFirstDto) {
  await axios.post("/v1/sessions/access-first", {
    email: data.email,
  });
}

export async function create(
  data: SessionCreateDto,
): Promise<SessionCreateResponse> {
  return await axios.post("/v1/sessions", {
    email: data.email,
    password: data.password,
  });
}

export async function licenseControl(
  data: SessionLicenseControlDto,
): Promise<SessionCreateResponse> {
  return await axios.post("/v1/sessions/license-control", {
    token: data.token,
    licenseId: data.licenseId,
  });
}

export async function accessToken(data: SessionAccessTokenDto) {
  return await axios.post("/v1/sessions/access-token", {
    email: data.email,
    token: data.code,
  });
}

export async function resetPassword(data: SessionResetPasswordDto) {
  await axios.post("/v1/sessions/reset-password", {
    password: data.password,
    token: data.token,
  });
}

export async function forgotPassword(data: SessionForgotPasswordDto) {
  await axios.post("/v1/sessions/forgot-password", {
    email: data.email,
  });
}

export async function firstAccessToken(
  data: SessionFirstAccessTokenDto,
): Promise<SessionFirstAccessTokenResponseDto> {
  return await axios.post("/v1/sessions/first-access/token", {
    identity: data.identity,
    password: data.password,
    token: data.token,
  });
}
