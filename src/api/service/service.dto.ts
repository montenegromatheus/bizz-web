export interface CreateServiceDto {
  name: string;
  price: number;
  duration: number;
  description: string;
}

export interface UpdateServiceDto extends CreateServiceDto {}
