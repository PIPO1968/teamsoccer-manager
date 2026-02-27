
import { useSearchParams } from "react-router-dom";

export function useThreadPagination() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const postsPerPage = 10;

  const handlePageChange = (page: number) => {
    setSearchParams({ page: page.toString() });
  };

  return {
    currentPage,
    postsPerPage,
    handlePageChange
  };
}
