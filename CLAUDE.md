# Gloriaz Daughter ERP - Claude Guidance

## Build & Development Commands
- **Dev Server**: `npm run dev`
- **Build**: `npm run build`
- **Lint**: `npm run lint`
- **Preview Build**: `npm run preview`

## Project Overview
A fashion/tailoring ERP system built with React, Vite, Supabase, and Tailwind CSS. It manages inventory, orders, employees, and customers.

## Tech Stack
- **Frontend**: React (Functional components, Hooks)
- **Styling**: Tailwind CSS v4, Lucide React (Icons)
- **State Management**: Zustand, React Context API
- **Data Fetching**: TanStack Query (React Query)
- **Backend**: Supabase (Auth, DB, RLS)
- **Forms**: React Hook Form
- **Tables**: TanStack Table
- **Charts**: Recharts

## Coding Guidelines
- **Naming Conventions**:
  - Components & Pages: `PascalCase.jsx` (e.g., `MaterialCard.jsx`, `Dashboard.jsx`)
  - Services/Stores/Hooks/Utils: `camelCase.js` (e.g., `orderService.js`, `useAuthStore.js`, `useOrdersRealtime.js`)
- **Structure**:
  - `src/components`: UI components grouped by feature/layout.
  - `src/services`: API interactions with Supabase.
  - `src/store`: Zustand stores for global state.
  - `src/pages`: Main view components.
- **Best Practices**:
  - Use functional components and hooks.
  - Use TanStack Query for server state and Zustand for client state.
  - Prefer Lucide React for iconography.
  - Follow the established design system (Pink primary color).
  - Ensure Row Level Security (RLS) is considered when interacting with Supabase.
