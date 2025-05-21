export interface CustomerCreateDto {
  name: string;
  phone: string;
  birthDate: Date | null;
}

export interface CustomerUpdateDto extends CustomerCreateDto {}
