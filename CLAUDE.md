# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 application built with TypeScript, Tailwind CSS, and Supabase. The app is a presentation management platform (formerly "prestr-web") that allows organizations to manage presentations, slides, and projects in a hierarchical folder structure. It features:

- Multi-tenant organization system with dynamic routing (`[organization]` routes)
- Authentication via Supabase with protected routes middleware
- Hierarchical content management (organizations > projects/folders > presentations > slides)
- PowerPoint upload functionality with Cloudinary integration
- Component-based architecture with reusable UI components

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Code Architecture

### App Structure (App Router)

- **Root layout**: `src/app/layout.tsx` - Uses Inter and Lexend fonts, global Tailwind CSS
- **Authentication routes**: `src/app/(auth)/` - Grouped routes for login/register with `LoginForm.tsx` and `RegisterForm.tsx`
- **Dynamic organization routes**: `src/app/[organization]/[[...slug]]/page.tsx` - Handles all organization-specific content with catch-all routing
- **Profile routes**: `src/app/profile/` - User profile management
- **Auth confirmation**: `src/app/auth/confirm/route.ts` - Supabase auth callback

### Key Components Architecture

- **View Components**: `SlideView.tsx`, `PresentationView.tsx`, `PresentationViewClient.tsx` (externalized from main page)
- **Modal Components**: Create/Edit modals for projects, folders, presentations with form handling
- **Content Management**: `FolderView.tsx`, `FolderContentList.tsx`, `ProjectList.tsx` for hierarchical content display
- **Upload System**: `PowerPointUpload.tsx`, `UploadModal.tsx` with Cloudinary integration
- **Layout Components**: `OrgHeader.tsx`, `CompactOrgHeader.tsx`, `AuthHeader.tsx`, `Footer.tsx` for consistent UI structure

### Data Layer

- **Supabase Integration**:
  - Client: `src/lib/supabase/client.ts` for browser-side operations
  - Server: `src/lib/supabase/server.ts` for server-side operations
  - Database types: `types/database.types.ts` (auto-generated from Supabase schema)
- **Action Files**: `auth-actions.ts`, `project-actions.ts`, `folder-actions.ts`, `presentation-actions.ts`, `slide-actions.ts` for server actions
- **Third-party APIs**: `cloudinary.ts` for image/file management

### Authentication & Routing

- **Middleware**: `middleware.ts` handles authentication, route protection, and dynamic organization routing
- **Protected routes**: `/profile`, organization routes require authentication
- **Auth routes**: `/login`, `/register` redirect authenticated users
- **Dynamic routing**: Organizations accessible via `/[organization-name]` with nested folder/presentation paths

### Database Schema Structure

The app uses the following main entities:

- **organizations**: Multi-tenant organizations with metadata and settings
- **folders**: Hierarchical folder structure (projects are top-level folders)
- **presentations**: PowerPoint presentations within folders
- **slides**: Individual slides within presentations
- **access_tokens**: Temporary access for presentation sharing

### Type System

- **Centralized Types**: All types in `src/types/` with barrel exports from `@/types`
- **Type Organization**:
  - `entities/` - Database entity types (Organization, Project, Folder, Presentation, Slide)
  - `forms/` - Form-related types and validation schemas
  - `api/` - API request/response types and search interfaces (Typesense integration)
  - `components/` - Component prop interfaces and action types
- **Usage**: Import from `@/types` for commonly used types
- **Database Types**: Auto-generated in `database.types.ts` from Supabase schema

### Design System

- **UI Reference Library**: `design/application-ui/` contains Tailwind Plus components organized by category:
  - `application-shells/` - Page layouts with sidebars, headers
  - `overlays/` - Modals, dialogs, notifications
  - `forms/` - Input groups, form layouts
  - `data-display/` - Tables, lists, cards
  - `navigation/` - Navbars, breadcrumbs, tabs
  - `page-examples/` - Complete page templates
- **IMPORTANT**: Never import from `design/` - copy JSX and adapt to TypeScript/Next.js
- **Styling**: Tailwind CSS v4 with custom configuration, `@tailwindcss/forms` plugin
- **Typography**: Inter (body) and Lexend (headings) fonts from Google Fonts

## Important Implementation Notes

### Dynamic Organization Routing

The `[organization]/[[...slug]]` route handles complex nested routing:

- Root: `/org-name` shows top-level projects
- Folders: `/org-name/folder1/folder2` shows folder contents
- Presentations: `/org-name/folder/presentation.presentation` shows presentation view
- Slides: `/org-name/folder/slide.slide` shows individual slide

### Type Safety

- All database operations use typed interfaces from `database.types.ts`
- Components use Pick utility types to select only required fields
- Strict TypeScript configuration with proper path aliases (`@/*` maps to `./src/*`)

### Performance Considerations

- Uses `revalidate = 3600` for data freshness (1 hour cache)
- Implements proper loading and error states
- Uses Supabase RPC functions for complex queries (e.g., `get_folder_id_by_full_path`)

## Coding Standards (from .cursor/rules)

### Component Organization

- Prefer colocating small components next to their route when specific to that route
- Put shared, reusable components in `src/components/` with strongly typed props
- Use server components by default; add `"use client"` only when needed (state/effects/refs)

### TypeScript

- Strongly type public component props and exported functions. Avoid `any`
- Prefer explicit component props types over `React.FC`
- Use meaningful names: functions are verbs; variables are descriptive nouns
- Handle edge cases early; return early to avoid deep nesting

### Design Library Usage

- **Never import from `design/application-ui/`** - this is a reference library only
- Instead: find component, confirm it matches use case, copy raw JSX, adapt to TypeScript/Next.js
- Files use `@tags` for discovery; use keywords to match filenames
- Convert to TSX: type component props, remove unused imports, replace placeholder data
- Keep Tailwind classes; adjust brand colors if needed (primary: `indigo`, danger: `rose`, success: `emerald`)

### Styling

- Use Tailwind classes directly in JSX; avoid inline styles
- Prefer common color scales: `slate/gray/zinc` for neutrals; `indigo` for brand accent
- Support dark mode with `dark:` variants for backgrounds, text, borders, focus states
- Include accessible focus styles: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500`
- Responsive first: use `sm / md / lg / xl / 2xl` breakpoints

### Security & Accessibility

- Avoid `dangerouslySetInnerHTML`; if required, sanitize inputs
- Always include descriptive `alt` text for images
- Use semantic elements (`button`, `nav`, `main`, `section`, `h1`–`h6`)
- Ensure labels/aria for form controls; associate labels using `htmlFor`/`id`
- Provide visible focus states; ensure sufficient contrast
- Keyboard support: all interactive elements must be reachable via tab
- Do not expose secrets to the client; read environment variables on the server only
