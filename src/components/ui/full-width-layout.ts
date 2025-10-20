// Full-width layout utilities for the FOA SmartSite platform
// These utilities ensure content uses the full available width without centering constraints

export const fullWidthLayoutClasses = {
  // Main container for pages - eliminates all centering and max-width constraints  
  pageContainer: "w-full min-h-screen bg-background",
  
  // Content wrapper with responsive padding but no width limits
  contentWrapper: "w-full px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4",
  
  // Dashboard grid that expands to full width
  dashboardGrid: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 w-full",
  
  // KPI cards grid that adapts to available space
  kpiGrid: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full",
  
  // Table container with proper horizontal scroll
  tableContainer: "w-full overflow-x-auto scrollbar-thin",
  
  // Flex layout for headers and controls
  headerFlex: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full",
  
  // Cards that expand to available space
  expandingCard: "w-full min-w-0 flex-1",
  
  // Grid that fills available space
  fluidGrid: "grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-3 sm:gap-4 lg:gap-6 w-full",
  
} as const;

// Helper function to combine layout classes with custom ones
export const combineLayoutClasses = (...classes: (string | undefined | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};