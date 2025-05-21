export interface UserUpdateDto {
  email?: string;
  name?: string;
  phone?: string;
  license?: string;
  identity?: string;
}

export interface UserCreateDto {
  email: string;
  name: string;
  identity: string;
  license: string;
  password?: string;
}
