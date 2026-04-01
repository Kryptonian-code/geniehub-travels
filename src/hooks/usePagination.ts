import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";

interface UsePaginationOptions {
  pageParam?: string;
  sizeParam?: string;
  defaultPageSize?: number;
}

export function usePagination<T>(items: T[], options: UsePaginationOptions = {}) {
  const {
    pageParam = "page",
    sizeParam = "pageSize",
    defaultPageSize = 10,
  } = options;
  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = Math.max(1, Number(searchParams.get(pageParam) ?? 1) || 1);
  const pageSize = Math.max(1, Number(searchParams.get(sizeParam) ?? defaultPageSize) || defaultPageSize);
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedItems = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, safePage, pageSize]);

  function updateParams(nextPage: number, nextPageSize = pageSize) {
    const next = new URLSearchParams(searchParams);
    next.set(pageParam, String(nextPage));
    next.set(sizeParam, String(nextPageSize));
    setSearchParams(next, { replace: true });
  }

  function setPage(page: number) {
    updateParams(Math.min(Math.max(1, page), totalPages));
  }

  function setPageSize(nextPageSize: number) {
    updateParams(1, nextPageSize);
  }

  return {
    currentPage: safePage,
    pageSize,
    totalItems,
    totalPages,
    paginatedItems,
    hasNextPage: safePage < totalPages,
    hasPrevPage: safePage > 1,
    setPage,
    setPageSize,
  };
}
