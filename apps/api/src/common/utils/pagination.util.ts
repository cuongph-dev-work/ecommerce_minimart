import { PaginationMeta, PaginatedResponse } from '../dto/pagination.dto';

export function createPaginationMeta(
  page: number,
  limit: number,
  total: number,
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

export function createPaginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
): PaginatedResponse<T> {
  return {
    data,
    pagination: createPaginationMeta(page, limit, total),
  };
}

