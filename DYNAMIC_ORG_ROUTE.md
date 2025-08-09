# Dynamic Organization Route

This feature provides a dynamic route at `/:organization` that displays organization profiles and their projects.

## Files Created

### Core Route Files

- `src/app/[organization]/page.tsx` - Main organization page with server-side rendering
- `src/app/[organization]/loading.tsx` - Loading skeleton during navigation
- `src/app/[organization]/not-found.tsx` - Custom 404 page for missing organizations

### Components

- `src/components/OrgHeader.tsx` - Organization profile header display
- `src/components/ProjectList.tsx` - Project grid with search and filtering

### Configuration

- `src/lib/supabase/server.ts` - Server-side Supabase client (already existed, verified compatibility)

## Features

### Organization Profile Display

- Organization name, description, and metadata
- Profile picture or fallback initial
- Website link (if provided)
- Location information
- Tags display
- Responsive design

### Projects List

- Grid layout of top-level projects (folders with `parent_id IS NULL`)
- Project visibility badges (public, private, restricted)
- Client-side search by project name and tags
- Filter by visibility level
- Empty states for no projects or no search results
- Responsive grid (1-3 columns based on screen size)

### Technical Implementation

- **SSR**: Server-side rendering with dynamic metadata generation
- **Caching**: Configurable revalidation (currently set to 0 for development)
- **TypeScript**: Fully typed with database schema types
- **Error Handling**: Proper 404 handling for missing organizations
- **Performance**: Optimized queries with specific field selection

## Database Requirements

The feature expects these Supabase tables:

### `organizations`

- `id` (uuid, primary key)
- `organization_name` (text, unique) - used for URL routing
- `metadata` (json) - contains name, about, website, location, profilePicture, displayMembers
- `tags` (text[]) - array of organization tags

### `folders` (projects)

- `id` (uuid, primary key)
- `folder_name` (text) - project name
- `organization_id` (uuid, foreign key → organizations.id)
- `parent_id` (uuid | null) - null for top-level projects
- `full_path` (text | null) - optional project path
- `tags` (text[]) - array of project tags
- `visibility` (enum: 'public' | 'private' | 'restricted')

## Environment Variables

Required environment variables (should be in `.env.local`):

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Usage Examples

### Access Organization Pages

- Visit `/acme` to view the "acme" organization
- Visit `/my-company` to view the "my-company" organization
- Missing organizations automatically show the custom 404 page

### Search and Filter Projects

- Use the search bar to find projects by name or tags
- Use the visibility dropdown to filter by public/private/restricted
- Results update in real-time on the client side

## Performance Notes

- **Caching**: Currently disabled (`revalidate = 0`) for development
- **Production**: Consider setting `revalidate = 3600` for hourly updates
- **Queries**: Optimized to select only necessary fields
- **Loading**: Skeleton loading states for better UX

## Security Considerations

- Read-only database operations
- Assumes proper RLS policies in Supabase
- No authentication required for viewing public organizations
- Visibility filtering respects database enum constraints

## Future Enhancements

Possible improvements:

- `generateStaticParams` for popular organizations (with privacy considerations)
- Project detail pages (`/[organization]/[project]`)
- Organization member listings (if `displayMembers` is true)
- Project analytics and statistics
- Advanced search with date filters
- Bulk project operations
