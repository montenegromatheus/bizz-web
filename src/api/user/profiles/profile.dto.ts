export interface ProfileUpdateDto {
  email?: string;
  name?: string;
}

export interface ProfilePasswordDto {
  oldPassword: string;
  password: string;
}

export type ProfileAvatarImageDto = File;

export interface ProfileDeletedDto {
  identity: string;
}
