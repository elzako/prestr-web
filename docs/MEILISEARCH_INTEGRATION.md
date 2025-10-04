# MeiliSearch Integration

## Overview

The AddSlideModal component has been updated to use MeiliSearch for searching and browsing slides, leveraging the existing search infrastructure already in place for the main search feature.

## Implementation Details

### Search Function

Uses `searchSlides` from `@/lib/search-actions`, which:

- Connects to MeiliSearch with the 'slides' index
- Applies role-based visibility filtering (public/internal/restricted)
- Filters by organization and project ID
- Returns results with pre-generated image URLs

### Key Features

**1. Full-Text Search**

- Searches across slide content, names, and descriptions
- Supports MeiliSearch's powerful search capabilities
- Provides ranked, relevant results

**2. Wildcard Browsing**

- When search term is empty, uses `*` wildcard query
- Shows all available slides from the project
- Useful for browsing without specific search criteria

**3. Permission-Aware**

- Respects slide visibility settings:
  - **PUBLIC**: Available to everyone
  - **INTERNAL**: Only to organization members
  - **RESTRICTED**: Only to users with project access
- Server-side permission filtering ensures security

**4. Client-Side Filtering**

- Excludes slides already in the presentation
- Done client-side after MeiliSearch returns results
- Passed via `excludeSlideIds` prop

**5. Performance Optimization**

- Debounced search (300ms delay)
- Limit of 100 results
- Efficient filtering pipeline

## Usage in AddSlideModal

```typescript
const response = await searchSlides({
  organizationId,
  projectId,
  query: debouncedSearchTerm.trim() || '*',
  limit: 100,
  offset: 0,
})

// Filter out slides already in presentation
const filteredResults = response.results.filter(
  (result) => !excludeSlideIds.includes(result.id),
)
```

## Benefits Over API Endpoint

1. **Consistency**: Uses the same search infrastructure as main search
2. **Performance**: MeiliSearch is optimized for fast, full-text search
3. **Features**: Inherits all MeiliSearch features (typo tolerance, ranking, etc.)
4. **Maintainability**: Single search implementation to maintain
5. **Security**: Consistent permission model across the application

## Search Query Behavior

| Search Term  | Query Sent   | Behavior                                      |
| ------------ | ------------ | --------------------------------------------- |
| Empty        | `*`          | Returns all slides from project (up to limit) |
| "chart"      | "chart"      | Full-text search for "chart" in slide content |
| "Q4 revenue" | "Q4 revenue" | Searches for both terms with ranking          |

## Configuration

Requires MeiliSearch environment variables:

- `NEXT_PUBLIC_SEARCH_URL` - MeiliSearch server URL
- `NEXT_PUBLIC_SEARCH_KEY` - API key for MeiliSearch

## Type Definitions

```typescript
interface SearchOptions {
  organizationId: string
  projectId?: string | null
  query: string
  limit?: number
  offset?: number
  filters?: string[]
  userRoles?: UserRoles | null
}

interface SearchResult extends MeiliSearchSlideResult {
  imageUrl?: string
  parent_path: string | null
}
```

## Future Enhancements

Potential improvements:

- **Faceted Search**: Add filters for slide attributes (has_chart, has_table, etc.)
- **Sorting**: Allow sorting by date, relevance, name
- **Pagination**: Support infinite scroll for large result sets
- **Search Highlighting**: Show matched terms in results
- **Recent Slides**: Boost recently created/modified slides
- **Usage Stats**: Prioritize frequently used slides

## Related Files

- `src/lib/search-actions.ts` - Core search implementation
- `src/types/api/search.ts` - Type definitions
- `src/components/SearchResults.tsx` - Main search UI (reference implementation)
- `src/components/AddSlideModal.tsx` - Uses MeiliSearch for slide browsing
