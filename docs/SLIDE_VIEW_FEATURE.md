# Dynamic Slide View Feature

This document describes the implementation of the dynamic slide view feature that allows users to view individual slides through a dedicated URL pattern.

## Overview

The feature enables users to access individual slides using URLs that end with a `.slide` suffix, such as `/acme/project1/introduction.slide`. When accessed, users see a dedicated page displaying the slide's content, metadata, and contextual information.

## URL Pattern

The feature responds to the following URL pattern:

```
/{organization_name}/{folder_path}/{slide_name}.slide
```

**Examples:**

- `/acme/project1/introduction.slide`
- `/acme/project1/subfolder/conclusion.slide`
- `/myorg/presentations/marketing/slide1.slide`

## Implementation Details

### Route Structure

The implementation uses a catch-all dynamic route at `src/app/[organization]/[...slug]/page.tsx` that handles both:

1. **Folder views** - Traditional folder browsing (e.g., `/acme/project1`)
2. **Slide views** - Individual slide display (e.g., `/acme/project1/introduction.slide`)

### Detection Logic

The route determines whether to render a slide view or folder view by checking if the last URL segment ends with `.slide`:

```typescript
const lastSegment = slug[slug.length - 1]
const isSlideRoute = lastSegment?.endsWith('.slide')
```

### Data Fetching Sequence

For slide views, the system follows this exact sequence as specified in the PRD:

1. **Get Organization ID**: Uses the `organization_name` from the URL to query the `organizations` table
2. **Get Parent Folder ID**: Extracts the folder path and calls the Supabase function `get_folder_id_by_full_path`
3. **Get Slide Data**: Queries the `slides` table using both `parent_id` and `slide_name`

```typescript
// Step 1: Get organization
const organization = await getOrganization(organizationName)

// Step 2: Get folder ID using the full path
const folderId = await getFolderId(organization.id, folderPath)

// Step 3: Get slide data
const slide = await getSlideData(folderId, slideName)
```

### Database Dependencies

The feature requires:

- `organizations` table with `organization_name` field for routing
- `folders` table with hierarchical structure
- `slides` table with `parent_id` and `slide_name` fields
- `get_folder_id_by_full_path` PostgreSQL function in Supabase

## User Interface

### Slide Display Components

The slide view includes:

1. **Organization Header** - Reuses the existing `OrgHeader` component
2. **Breadcrumb Navigation** - Shows the path from organization → folder → slide
3. **Slide Metadata Section** - Displays creation date, last updated, slide number, etc.
4. **Content Display** - Shows text content from the slide's metadata
5. **Tags** - Displays any associated tags
6. **Presentation Context** - Shows related presentation information if available
7. **Action Buttons** - "Back to Folder" and "View Original" (if URL available)

### Visual Design

The slide view follows the existing design system:

- Consistent with other pages in the application
- Responsive design that works on all screen sizes
- Uses Tailwind CSS classes for styling
- Maintains accessibility standards

## Updated Components

### FolderContentList Component

Updated to support linking to slide views:

- Added `currentFolderPath` parameter to construct proper slide URLs
- Modified `SlideCard` component to be clickable and link to slide views
- Changed from button to link with proper href: `/{organization}/{folder_path}/{slide_name}.slide`

### Route Changes

- **Replaced** `src/app/[organization]/[folder_name]/page.tsx` with the more flexible catch-all route
- **Added** `src/app/[organization]/[...slug]/page.tsx` that handles both folders and slides
- **Added** corresponding `loading.tsx` and `not-found.tsx` files

## Error Handling

The implementation includes comprehensive error handling:

- **404 for Invalid Organization** - Returns `notFound()` if organization doesn't exist
- **404 for Invalid Folder Path** - Returns `notFound()` if folder path cannot be resolved
- **404 for Invalid Slide** - Returns `notFound()` if slide doesn't exist in the specified folder
- **Database Error Logging** - Logs errors to console for debugging
- **Graceful Fallbacks** - Empty arrays for missing data, null checks throughout

## URL Examples

### Working URLs (assuming data exists):

```
/acme/project1/introduction.slide
/microsoft/presentations/quarterly-review.slide
/startup/demo/slides/pitch-deck.slide
```

### Folder URLs (still supported):

```
/acme/project1
/microsoft/presentations
/startup/demo/slides
```

## Technical Notes

### Performance Considerations

- Server-side rendering for better SEO and initial load times
- Configurable revalidation (currently set to 0 for development)
- Efficient database queries with specific field selection

### Type Safety

- Fully typed with TypeScript
- Uses generated database types from Supabase
- Proper error handling with typed responses

### SEO & Metadata

- Dynamic metadata generation for both slide and folder views
- Descriptive titles and descriptions
- Proper Open Graph support ready for enhancement

## Future Enhancements

Potential improvements that could be added:

1. **Slide Content Rendering** - Rich content display beyond text
2. **Previous/Next Navigation** - Navigate between slides in a presentation
3. **Comments System** - Allow users to comment on slides
4. **Version History** - Show slide revision history
5. **Download Options** - PDF or image export of slides
6. **Sharing Features** - Social sharing or direct links
7. **Slide Thumbnails** - Preview images in folder listings

## Testing Recommendations

To test the implementation:

1. Verify slide URLs work: `/{org}/{folder}/{slide}.slide`
2. Confirm folder URLs still work: `/{org}/{folder}`
3. Test nested folder paths: `/{org}/{folder1}/{folder2}/{slide}.slide`
4. Verify 404 handling for invalid paths
5. Check responsive design on mobile devices
6. Test with slides that have various metadata configurations
