# Dynamic Presentation View Feature

This document describes the implementation of the dynamic presentation view feature that allows users to view individual presentations through a dedicated URL pattern ending with `.presentation`.

## Overview

The feature enables users to access individual presentations using URLs that end with a `.presentation` suffix, such as `/acme/project1/my-presentation.presentation`. When accessed, users see a dedicated page displaying the presentation's metadata, slide information, settings, and contextual details.

## URL Pattern

The feature responds to the following URL pattern:

```
/{organization_name}/{folder_path}/{presentation_name}.presentation
```

**Examples:**

- `/acme/project1/quarterly-review.presentation`
- `/microsoft/marketing/product-launch.presentation`
- `/startup/demo/pitch-deck.presentation`

## Implementation Details

### Route Structure

The implementation extends the existing catch-all dynamic route at `src/app/[organization]/[...slug]/page.tsx` to handle:

1. **Folder views** - Traditional folder browsing (e.g., `/acme/project1`)
2. **Slide views** - Individual slide display (e.g., `/acme/project1/slide.slide`)
3. **Presentation views** - Individual presentation display (e.g., `/acme/project1/presentation.presentation`)

### Detection Logic

The route determines the view type by checking the last URL segment:

```typescript
const lastSegment = slug[slug.length - 1]
const isSlideRoute = lastSegment?.endsWith('.slide')
const isPresentationRoute = lastSegment?.endsWith('.presentation')
```

### Data Fetching Sequence

For presentation views, the system follows the same sequence as specified in the slide PRD:

1. **Get Organization ID**: Uses the `organization_name` from the URL to query the `organizations` table
2. **Get Parent Folder ID**: Extracts the folder path and calls the Supabase function `get_folder_id_by_full_path`
3. **Get Presentation Data**: Queries the `presentations` table using both `parent_id` and `presentation_name`

```typescript
// Step 1: Get organization
const organization = await getOrganization(organizationName)

// Step 2: Get folder ID using the full path
const folderId = await getFolderId(organization.id, folderPath)

// Step 3: Get presentation data
const presentation = await getPresentationData(folderId, presentationName)
```

### Database Schema

The feature utilizes the `presentations` table with these key fields:

- `id` - Unique identifier
- `presentation_name` - Name used for URL routing
- `parent_id` - Foreign key to folders table
- `metadata` - JSON object containing `url` and `description`
- `slides` - Array of slide objects with order, slide_key, object_id, and url
- `settings` - Access control settings (pptxDownloadRole, pdfDownloadRole, chatRole)
- `tags` - Array of string tags
- `locked` - Boolean indicating if presentation is locked
- `version` - Version number
- `created_at` / `updated_at` - Timestamps

## User Interface

### Presentation Display Components

The presentation view includes:

1. **Organization Header** - Reuses the existing `OrgHeader` component
2. **Breadcrumb Navigation** - Shows the path from organization → folder → presentation
3. **Presentation Header** - Name, description, lock status, and version badges
4. **Metadata Section** - Creation date, last updated, total slides count
5. **Slides Overview** - Grid displaying all slides with order numbers and view links
6. **Tags Display** - Shows any associated tags
7. **Access Settings** - PDF/PPTX download permissions and chat access roles
8. **Action Buttons** - "Back to Folder" and "View Original" (if URL available)

### Visual Design Features

- **Lock Status Indicator** - Yellow badge with lock icon when presentation is locked
- **Version Badge** - Blue badge showing version number (e.g., "v2")
- **Slide Grid** - Organized display of slides with numbered indicators
- **Access Role Display** - Human-readable permission levels
- **Responsive Layout** - Works on all screen sizes

### Slide List Component

The slides section shows:

- **Ordered List** - Slides sorted by their order property
- **Numbered Indicators** - Circular badges with slide numbers
- **Individual Slide Links** - Direct links to slide URLs when available
- **Fallback Ordering** - Uses array index when order property is missing

## Updated Components

### FolderContentList Component

Updated to support linking to presentation views:

- Modified `PresentationCard` component to accept `organizationName` and `currentFolderPath`
- Changed from button to clickable link with proper href: `/{organization}/{folder_path}/{presentation_name}.presentation`
- Maintained consistent visual design with other content cards

### Route Enhancements

- **Extended Detection** - Now handles `.slide`, `.presentation`, and folder routes
- **Enhanced Metadata** - Dynamic metadata generation for all route types
- **Error Handling** - Comprehensive 404 handling for invalid presentations

## Error Handling

The implementation includes comprehensive error handling:

- **404 for Invalid Organization** - Returns `notFound()` if organization doesn't exist
- **404 for Invalid Folder Path** - Returns `notFound()` if folder path cannot be resolved
- **404 for Invalid Presentation** - Returns `notFound()` if presentation doesn't exist in the specified folder
- **Database Error Logging** - Logs errors to console for debugging
- **Graceful Fallbacks** - Handles missing metadata, slides, or settings gracefully

## URL Examples

### Working Presentation URLs (assuming data exists):

```
/acme/project1/quarterly-review.presentation
/microsoft/presentations/product-launch.presentation
/startup/demo/pitch-deck.presentation
/company/marketing/campaign-2024.presentation
```

### Integration with Existing Routes:

```
/acme/project1                           # Folder view
/acme/project1/slide-name.slide         # Slide view
/acme/project1/presentation.presentation # Presentation view
```

## Technical Features

### Performance Considerations

- Server-side rendering for SEO and fast initial loads
- Efficient database queries with specific field selection
- Optimized component rendering with proper React keys

### Type Safety

- Fully typed TypeScript implementation
- Uses generated Supabase database types
- Proper error handling with typed responses

### SEO & Metadata

- Dynamic metadata generation for presentation views
- Descriptive titles: `"Presentation Name - Folder Path - Organization"`
- Semantic descriptions for search engines

## Access Control Integration

The presentation view displays access control settings:

### Download Permissions

- **PDF Download Role** - Who can download PDF versions
- **PPTX Download Role** - Who can download PowerPoint versions

### Interactive Permissions

- **Chat Role** - Who can access chat features for the presentation

### Role Display

- Roles are displayed in human-readable format (e.g., "admin_only" becomes "Admin Only")
- Clear visual separation between different permission types

## Future Enhancements

Potential improvements:

1. **Slide Thumbnails** - Preview images for each slide
2. **Presentation Player** - Full-screen presentation mode
3. **Comments System** - Presentation-level and slide-level comments
4. **Version History** - Track and display presentation changes
5. **Collaboration Features** - Real-time editing indicators
6. **Export Options** - Direct PDF/PPTX download from the view
7. **Analytics** - View counts and engagement metrics

## Testing Recommendations

To test the implementation:

1. Verify presentation URLs work: `/{org}/{folder}/{presentation}.presentation`
2. Confirm folder and slide URLs still work properly
3. Test nested folder paths: `/{org}/{folder1}/{folder2}/{presentation}.presentation`
4. Verify 404 handling for invalid paths
5. Check responsive design on various devices
6. Test with presentations that have different metadata configurations
7. Verify lock status and version displays work correctly
8. Test with presentations containing various slide configurations

## Integration Notes

The presentation view feature seamlessly integrates with:

- Existing organization and folder structure
- Slide view functionality
- Error handling and not-found pages
- Loading states and skeleton screens
- Consistent design system and component library
