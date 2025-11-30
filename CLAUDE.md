# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm run dev       # Start development server (port 8080)
npm run build     # Production build
npm run lint      # Run ESLint
npm run preview   # Preview production build locally
```

## Architecture Overview

This is an **Investment Fund Management Platform** - a React SPA where fund managers (admins) create and manage investment funds, and investors (users) build portfolios.

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Shadcn/ui (Radix primitives) + Tailwind CSS
- **State**: TanStack React Query (server state), React Hook Form + Zod (forms)
- **Backend**: Supabase (PostgreSQL + Auth)
- **Charts**: Recharts

### Project Structure

```
src/
├── pages/           # Route components (Index, Auth, Portfolio, Funds, Admin)
├── components/
│   ├── ui/          # Shadcn/ui primitives (~60 components)
│   ├── dashboard/   # Layout, sidebar, admin views
│   ├── funds/       # Fund CRUD, investment/redemption dialogs
│   └── portfolio/   # Portfolio views and charts
├── hooks/           # Custom hooks (use-toast, use-mobile)
├── integrations/supabase/  # Supabase client and auto-generated types
└── lib/utils.ts     # Tailwind cn() utility
```

### Routing Structure (src/App.tsx)

- `/` - Landing page
- `/auth` - Authentication (sign in/sign up)
- `/portfolio` - User portfolio view (protected)
- `/funds` - Browse available funds (protected)
- `/dashboard` - Admin fund management (protected, admin only)

All protected routes are wrapped by `DashboardWrapper` which handles auth state and role-based navigation.

### Database Schema

**Core Tables**:
- `profiles` - User profiles (linked to Supabase Auth)
- `user_roles` - Role assignments with `app_role` enum: `admin` | `user`
- `funds` - Investment funds with `risk_level` enum: `low` | `moderate` | `high` | `very_high`
- `investments` - User investments linking profiles to funds

**Supporting Tables**:
- `currencies`, `financial_instruments` - Reference data
- `fund_currencies`, `fund_instruments` - Many-to-many relationships

**Key Function**: `has_role(_role, _user_id)` - RLS helper for authorization

Database types are auto-generated in `src/integrations/supabase/types.ts`.

### Authentication & Authorization

- Supabase Auth handles authentication (email/password)
- Role-based access: admins manage funds, users invest
- `DashboardWrapper` checks session and redirects unauthenticated users to `/auth`
- Sidebar navigation adapts based on user role

### Path Aliases

Use `@/` prefix for imports (maps to `src/`):
```typescript
import { Button } from "@/components/ui/button"
```

## Lovable.dev Integration

This project is built with Lovable.dev. Changes made via Lovable are auto-committed. The Lovable Tagger plugin is included in the Vite config for component tracking.
