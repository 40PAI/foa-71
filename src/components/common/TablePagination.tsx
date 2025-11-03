import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  startIndex: number;
  endIndex: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;
  itemsPerPageOptions?: number[];
  showItemsPerPage?: boolean;
  showInfo?: boolean;
  className?: string;
}

export function TablePagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  startIndex,
  endIndex,
  onPageChange,
  onItemsPerPageChange,
  itemsPerPageOptions = [10, 25, 50, 100, 500, 1000],
  showItemsPerPage = true,
  showInfo = true,
  className,
}: TablePaginationProps) {
  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push('ellipsis-start');
      }

      // Show pages around current
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('ellipsis-end');
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className={cn("flex flex-col gap-4 py-4", className)}>
      {/* Info section */}
      {showInfo && (
        <div className="text-sm text-muted-foreground text-center md:text-left">
          Showing <span className="font-medium text-foreground">{startIndex + 1}</span> to{' '}
          <span className="font-medium text-foreground">{endIndex}</span> of{' '}
          <span className="font-medium text-foreground">{totalItems}</span> records
        </div>
      )}

      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Items per page selector */}
        {showItemsPerPage && (
          <div className="flex items-center gap-2 flex-wrap justify-center md:justify-start">
            <span className="text-sm text-muted-foreground whitespace-nowrap">Rows per page:</span>
            <div className="flex gap-1">
              {itemsPerPageOptions.map((option) => (
                <Button
                  key={option}
                  variant={itemsPerPage === option ? "default" : "outline"}
                  size="sm"
                  onClick={() => onItemsPerPageChange(option)}
                  className="h-8 min-w-[50px]"
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Page navigation */}
        <div className="flex items-center gap-2">
          {/* Previous button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="h-8"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Previous</span>
          </Button>

          {/* Page numbers - Desktop */}
          <div className="hidden md:flex items-center gap-1">
            {pageNumbers.map((page, index) => {
              if (typeof page === 'string') {
                return (
                  <span key={`${page}-${index}`} className="px-2 text-muted-foreground">
                    ...
                  </span>
                );
              }

              return (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(page)}
                  className="h-8 min-w-[40px]"
                >
                  {page}
                </Button>
              );
            })}
          </div>

          {/* Page indicator - Mobile */}
          <div className="md:hidden text-sm text-muted-foreground px-3">
            Page <span className="font-medium text-foreground">{currentPage}</span> of{' '}
            <span className="font-medium text-foreground">{totalPages}</span>
          </div>

          {/* Next button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="h-8"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
