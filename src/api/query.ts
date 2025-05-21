export interface QueryDto {
  perPage?: number;
  page?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  query?: string;
  blockedBy?: string;
}
