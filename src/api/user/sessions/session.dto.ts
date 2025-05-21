export interface SessionAccessFirstDto {
  email: string;
}

export interface SessionResetPasswordDto {
  password: string;
  token: string;
}

export interface SessionForgotPasswordDto {
  email: string;
}

export interface SessionCreateDto {
  email: string;
  password: string;
}

export interface SessionCreateResponse {
  token: string;
  refreshToken: string;
  partialToken?: string;
  user: {
    id: string;
    name: string;
    displayName: string;
    email: string;
  };
}

export interface SessionAccessTokenDto {
  email: string;
  code: string;
}

export interface SessionFirstAccessTokenDto {
  identity: string;
  password: string;
  token: string;
}

export interface SessionFirstAccessTokenResponseDto {
  user: {
    id: string;
    email: string;
    name: string;
    license: string;
  };
  refreshToken: string;
  token: string;
}

export interface SessionLicenseControlDto {
  token: string;
  licenseId: string;
}
