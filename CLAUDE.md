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
- **View Components**: `SlideView.tsx`, `PresentationView.tsx`, `PresentationView.tsx` (externalized from main page)
- **Modal Components**: Create/Edit modals for projects, folders with form handling
- **Content Management**: `FolderViewClient.tsx`, `FolderContentList.tsx`, `ProjectList.tsx` for hierarchical content display
- **Upload System**: `PowerPointUpload.tsx`, `UploadModal.tsx` with Cloudinary integration
- **Layout Components**: `OrgHeader.tsx`, `Header.tsx`, `Footer.tsx` for consistent UI structure

### Data Layer
- **Supabase Integration**:
  - Client: `src/lib/supabase/client.ts` for browser-side operations
  - Server: `src/lib/supabase/server.ts` for server-side operations
  - Database types: `types/database.types.ts` (auto-generated from Supabase schema)
- **Action Files**: `auth-actions.ts`, `project-actions.ts`, `folder-actions.ts` for server actions
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

### Design System
- **UI Components**: Located in `design/` directory with Tailwind Plus components
- **Styling**: Tailwind CSS v4 with custom configuration, includes forms plugin
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
- Uses `revalidate = 0` for data freshness (consider changing to 3600 for production)
- Implements proper loading and error states
- Uses Supabase RPC functions for complex queries (e.g., `get_folder_id_by_full_path`)