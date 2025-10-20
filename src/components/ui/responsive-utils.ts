// Responsive utility classes for consistent mobile-first design
export const responsiveUtils = {
  // Container and spacing utilities
  containers: {
    page: "space-y-2 sm:space-y-3 lg:space-y-4 xl:space-y-6 p-2 sm:p-4 lg:p-6",
    section: "space-y-2 sm:space-y-3 lg:space-y-4",
    card: "p-2 sm:p-3 lg:p-4 xl:p-6",
    cardHeader: "p-2 sm:p-3 lg:p-4 pb-1 sm:pb-2",
    cardContent: "p-2 sm:p-3 lg:p-4",
    cardCompact: "p-1 sm:p-2 lg:p-3",
  },

  // Grid utilities for different content types
  grids: {
    kpi: "grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4",
    kpiMobile: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4",
    cards: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 lg:gap-4",
    cardsLarge: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-6",
    charts: "grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4 lg:gap-6",
    materials: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 lg:gap-4",
    responsive: "grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-2 sm:gap-3 lg:gap-4",
  },

  // Typography utilities
  text: {
    title: "text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold leading-tight",
    subtitle: "text-sm sm:text-base text-muted-foreground",
    cardTitle: "text-sm sm:text-base lg:text-lg font-semibold line-clamp-2 leading-tight",
    body: "text-xs sm:text-sm",
    small: "text-xs",
    large: "text-base sm:text-lg lg:text-xl",
  },

  // Interactive element sizing
  interactive: {
    button: "h-8 sm:h-9 lg:h-10 px-2 sm:px-3 lg:px-4",
    buttonSm: "h-7 sm:h-8 px-1 sm:px-2",
    buttonIcon: "h-7 w-7 sm:h-8 sm:w-8 lg:h-9 lg:w-9 p-1 sm:p-2",
    buttonIconSm: "h-6 w-6 sm:h-7 sm:w-7 p-1",
    badge: "text-xs whitespace-nowrap px-1 sm:px-2",
    icon: "h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5",
    iconSm: "h-3 w-3 sm:h-4 sm:w-4",
  },

  // Layout utilities
  layout: {
    flex: "flex items-center gap-1 sm:gap-2 lg:gap-3",
    flexCol: "flex flex-col gap-1 sm:gap-2 lg:gap-3",
    between: "flex items-center justify-between gap-2",
    responsive: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4",
    header: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4",
  },

  // Content overflow handling
  overflow: {
    text: "truncate",
    multiline: "line-clamp-2",
    multilineLarge: "line-clamp-3",
    scroll: "overflow-x-auto scrollbar-thin",
    hidden: "overflow-hidden",
    container: "min-w-0 flex-1",
  },

  // Responsive spacing
  spacing: {
    xs: "gap-1 sm:gap-2",
    sm: "gap-2 sm:gap-3",
    md: "gap-2 sm:gap-3 lg:gap-4",
    lg: "gap-3 sm:gap-4 lg:gap-6",
    xl: "gap-4 sm:gap-6 lg:gap-8",
  },

  // Mobile-specific utilities
  mobile: {
    hide: "hidden sm:block",
    show: "sm:hidden",
    fullWidth: "w-full sm:w-auto",
    stack: "flex flex-col sm:flex-row",
  },
};

export default responsiveUtils;