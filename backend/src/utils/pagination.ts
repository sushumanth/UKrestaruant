export interface PaginationInput {
  page?: string | number;
  limit?: string | number;
}

export const parsePagination = (input: PaginationInput) => {
  const page = Math.max(1, Number(input.page ?? 1) || 1);
  const limit = Math.min(100, Math.max(1, Number(input.limit ?? 10) || 10));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};
