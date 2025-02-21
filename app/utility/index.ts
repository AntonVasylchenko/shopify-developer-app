interface PaginationType {
  take: number;
  skip: number;
  totalItems: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean,
  hasPrevPage: boolean
}

export const createPagination = (
  take: number,
  page: number,
  totalCount: number,
): PaginationType => {
  const takeNormalized = Math.max(1, take);
  const currentPage = Math.max(1, page);
  const totalPages = Math.max(1, Math.ceil(totalCount / takeNormalized));

  return {
    take: takeNormalized,
    skip: (currentPage - 1) * takeNormalized,
    totalItems: totalCount,
    currentPage: Math.min(currentPage, totalPages),
    totalPages:totalPages,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
};
