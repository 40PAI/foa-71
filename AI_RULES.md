# AI Rules and Guidelines for Dyad

This document outlines the technical stack and specific library usage rules for the Dyad AI assistant when working on this application. Adhering to these guidelines ensures consistency, maintainability, and optimal performance.

## 🚀 Tech Stack Overview

*   **Frontend Framework**: React (with TypeScript)
*   **Build Tool**: Vite
*   **Styling**: Tailwind CSS
*   **UI Components**: Shadcn/ui (built on Radix UI)
*   **State Management**: React Query (TanStack Query) for server state, React Context for global UI state
*   **Routing**: React Router DOM
*   **Icons**: Lucide React
*   **Backend/Database**: Supabase (PostgreSQL, Auth, Realtime)
*   **Charting**: Recharts

## 📚 Library Usage Guidelines

To maintain a consistent and efficient codebase, please adhere to the following rules when using libraries:

*   **UI Components (Shadcn/ui)**:
    *   **Always** prioritize `shadcn/ui` components for all UI elements (buttons, cards, forms, tables, dialogs, etc.).
    *   If a specific `shadcn/ui` component does not exist or doesn't meet the exact requirements, **do not modify the `shadcn/ui` component files directly**. Instead, create a new component in `src/components/` that wraps or extends the `shadcn/ui` component, or build a new component from scratch using Tailwind CSS.
    *   Ensure all `shadcn/ui` components are imported from `@/components/ui`.

*   **State Management (React Query)**:
    *   **Always** use `React Query` for fetching, caching, synchronizing, and updating server state.
    *   Define custom hooks for data fetching (e.g., `useProjects`, `useTasks`) in the `src/hooks/` directory.
    *   For global UI state that doesn't involve server interaction (e.g., theme, sidebar open/close), use `React Context` from `src/contexts/`.

*   **Styling (Tailwind CSS)**:
    *   **Exclusively** use Tailwind CSS utility classes for all styling. Avoid custom CSS files or inline styles unless absolutely necessary for dynamic, complex calculations.
    *   Leverage responsive design utilities provided by Tailwind (e.g., `sm:`, `md:`, `lg:`).
    *   Utilize the defined design tokens (colors, spacing, typography) from `index.css` and `tailwind.config.ts`.

*   **Icons (Lucide React)**:
    *   **Always** use icons from the `lucide-react` library. Import them directly as named exports.

*   **Forms (React Hook Form & Zod)**:
    *   **Always** use `react-hook-form` for form management.
    *   **Always** use `Zod` for schema validation with `react-hook-form` resolvers.

*   **Charting (Recharts)**:
    *   **Always** use `Recharts` for data visualization components.
    *   Ensure charts are responsive and integrate with the application's theme.

*   **Date Management (date-fns)**:
    *   **Always** use `date-fns` for all date manipulation and formatting tasks.

*   **Routing (React Router DOM)**:
    *   **Always** use `react-router-dom` for navigation and routing within the application. Keep routes defined in `src/App.tsx`.

*   **Notifications (Sonner)**:
    *   **Always** use `sonner` for toast notifications to provide user feedback. The `useSonnerToast` hook is available for consistent usage.

*   **File Uploads**:
    *   **Always** use the `FileUpload` component from `src/components/ui/file-upload.tsx` for handling file uploads to Supabase Storage.

*   **Currency Inputs**:
    *   **Always** use the `CurrencyInput` component from `src/components/ui/currency-input.tsx` for currency input fields.

By following these rules, we ensure a cohesive, high-quality application that is easy to develop and maintain.