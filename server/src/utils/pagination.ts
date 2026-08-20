import type { PaginationQuery } from "../types/common.js";

export const parsePagination = (
  query: Record<string, unknown>,
  defaults = { page: 1, limit: 10, maxLimit: 50 }
): PaginationQuery => {
  const page = Math.max(1, Number(query.page) || defaults.page);
  const limit = Math.min(defaults.maxLimit, Math.max(1, Number(query.limit) || defaults.limit));
  return { page, limit };
};
