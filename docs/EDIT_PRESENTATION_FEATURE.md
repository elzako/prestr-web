# Edit Presentation Feature

## Overview

The Edit Presentation feature allows users with edit permissions to modify presentation structure in a dedicated edit mode. Users can:

- **Reorder slides** via drag-and-drop
- **Remove slides** from the presentation
- **Add existing slides** from the project library

All changes are only persisted when explicitly saved, with the option to cancel and restore the original state.

## Background

Presentations and slides exist as separate entities in the database. The `presentations` table contains a `slides` JSONB column that maintains an ordered array of slide references, each containing:

- `order`: Integer representing slide position
- `slide_id`: UUID of the slide entity
- `object_id`: UUID of the associated object

Slides can be reused across multiple presentations within the same project.

## Implementation Summary

### 1. API Endpoints

#### **PATCH /api/presentations/[id]/reorder**

Updates the slides array for a presentation.

**Request Body:**

```json
{
  "slides": [
    {
      "order": 1,
      "slide_id": "uuid",
      "object_id": "uuid"
    }
  ]
}
```

**Features:**

- Validates slide data structure (no duplicates, sequential numbering)
- Checks edit permissions (admin/contributor only)
- Updates the `slides` JSONB column

#### **MeiliSearch Integration for Slide Search**

The AddSlideModal uses the existing MeiliSearch infrastructure (`searchSlides` from `@/lib/search-actions`).

**Features:**

- Full-text search across slide content, names, and descriptions
- Filters by project ID to show only slides from the same project
- Respects visibility and permissions (public/internal/restricted)
- Client-side filtering to exclude slides already in the presentation
- Uses wildcard (`*`) query when no search term to browse all available slides
- Debounced search (300ms) to reduce API calls

**See:** `docs/MEILISEARCH_INTEGRATION.md` for detailed documentation

### 2. Components

#### **AddSlideModal** - `src/components/AddSlideModal.tsx`

A modal dialog for browsing and adding slides to a presentation.

**Features:**

- **MeiliSearch Integration:** Uses the same search infrastructure as the main search feature
- **Full-Text Search:** Searches across slide content, names, and descriptions
- **Debounced Search:** 300ms delay to reduce unnecessary API calls
- **Wildcard Browsing:** Shows all available slides when search is empty
- **Permission Aware:** Respects slide visibility (public/internal/restricted)
- **Smart Filtering:** Excludes slides already in the presentation via `excludeSlideIds` prop
- Grid view with thumbnails
- Multi-select capability (checkboxes)
- Visual feedback for selected slides

#### **SlideGallery** - `src/components/SlideGallery.tsx`

Enhanced with full edit mode capabilities.

**New Props:**

- `organizationId` - for image URL generation
- `projectId` - for fetching available slides
- `isEditMode` - controlled edit state
- `onExitEditMode` - callback to exit edit mode

**New Features:**

- **Remove Button:** Red X button on each slide in edit mode
- **Add Slide Button:** Opens AddSlideModal
- **State Management:** Tracks added/removed/reordered slides
- **Edit Mode Controls:** Prominent control bar with status and actions

#### **PresentationViewClient** - `src/components/PresentationViewClient.tsx`

Updated to manage edit mode state and pass required props.

**Changes:**

- Button renamed from "Reorder Slides" to "Edit Presentation"
- Manages `isEditMode` state
- Passes `projectId` down to SlideGallery

### 3. User Flow

#### Normal Mode

1. User views presentation with slides displayed in order
2. Header shows "Edit Presentation" and "Edit Metadata" buttons (if user has edit permissions)

#### Entering Edit Mode

1. User clicks "Edit Presentation" button
2. UI changes:
   - "Edit Presentation" button disappears from header
   - Edit mode control bar appears showing:
     - Status indicator ("Edit Mode Active")
     - "Add Slide" button
     - "Cancel" and "Save Changes" buttons
   - Each slide shows:
     - Drag handle icon (top right)
     - Remove button (red X, top right)
   - Lightbox/preview disabled

#### Reordering Slides

1. User drags a slide to new position
2. Order numbers update immediately (local state only)
3. Visual feedback during drag (opacity, positioning)

#### Removing Slides

1. User clicks red X button on a slide
2. Slide removed from view (local state only)
3. Order numbers recalculate for remaining slides

#### Adding Slides

1. User clicks "Add Slide" button
2. AddSlideModal opens with:
   - Search bar
   - Grid of available slides (excludes slides already in presentation)
   - Checkboxes for multi-select
3. User searches/browses slides
4. User selects one or more slides
5. User clicks "Add (n)" button
6. Modal closes
7. Selected slides appear at end of presentation (local state only)

#### Saving/Canceling

- **Save:**
  1. User clicks "Save Changes"
  2. Loading state shown
  3. API called with complete updated slides array
  4. Database updated
  5. Page refreshes with new data
  6. Exit edit mode

- **Cancel:**
  1. User clicks "Cancel"
  2. All local changes discarded
  3. Original state restored
  4. Exit edit mode

## Technical Details

### State Management

- **`editedSlides`**: Current working state of slides during edit session
- **`originalSlides`**: Backup of initial state for cancel operation
- **`isEditMode`**: Boolean flag controlled by parent component
- **`isAddSlideModalOpen`**: Controls AddSlideModal visibility

### Data Flow

1. **Initial Load:** Presentation loaded with slides array
2. **Enter Edit Mode:** Original slides saved to backup
3. **Modifications:** All changes update `editedSlides` state
4. **Save:** Complete `editedSlides` array sent to API → database updated → page refreshed
5. **Cancel:** `originalSlides` restored to `editedSlides` → exit edit mode

### Permissions

- Only users with `admin` or `contributor` folder roles can edit
- Organization owners and admins also have permission
- Permissions checked on both frontend (UI visibility) and backend (API)

## Success Metrics

- ✅ Users can enter/exit edit mode
- ✅ Users can reorder slides via drag-and-drop
- ✅ Users can remove slides from presentations
- ✅ Users can search and add slides from project
- ✅ Save persists all changes accurately
- ✅ Cancel discards all changes and restores original state
- ✅ No data loss during edit operations
- ✅ Slides can be reused across presentations

## Files Modified/Created

**Created:**

- `src/components/AddSlideModal.tsx` - Modal for adding slides (uses MeiliSearch)
- `src/app/api/projects/[id]/slides/route.ts` - API for fetching available slides (can be removed - superseded by MeiliSearch)
- `docs/EDIT_PRESENTATION_FEATURE.md` - This documentation
- `docs/MEILISEARCH_INTEGRATION.md` - MeiliSearch integration details

**Modified:**

- `src/components/SlideGallery.tsx` - Added edit mode with add/remove/reorder
- `src/components/PresentationViewClient.tsx` - Renamed button, added state management
- `src/components/PresentationView.tsx` - Pass projectId prop
- `src/app/[organization]/[[...slug]]/page.tsx` - Fetch and pass projectId
- `src/types/components/view-props.ts` - Added projectId to PresentationViewProps
- `src/lib/presentation-actions.ts` - reorderSlides function (already existed)
- `src/app/api/presentations/[id]/reorder/route.ts` - API endpoint (already existed)

## Dependencies

- `@dnd-kit/core` - Drag-and-drop core
- `@dnd-kit/sortable` - Sortable list functionality
- `@dnd-kit/utilities` - Helper utilities
- `@headlessui/react` - Modal dialog components

## Testing Recommendations

### Manual Testing Checklist

1. **Edit Mode Activation:**
   - [ ] "Edit Presentation" button visible for users with edit permissions
   - [ ] Clicking button enters edit mode
   - [ ] Edit mode control bar appears
   - [ ] Edit Presentation button hides in edit mode

2. **Reorder Functionality:**
   - [ ] Slides can be dragged to new positions
   - [ ] Order numbers update immediately
   - [ ] Visual feedback during drag (opacity, positioning)
   - [ ] Keyboard navigation works

3. **Remove Functionality:**
   - [ ] Remove button (red X) visible on each slide in edit mode
   - [ ] Clicking remove button removes slide from view
   - [ ] Order numbers recalculate after removal
   - [ ] Can remove all slides except last one

4. **Add Slide Functionality:**
   - [ ] "Add Slide" button opens modal
   - [ ] Modal shows available slides (excludes current slides)
   - [ ] Search functionality works
   - [ ] Can select multiple slides
   - [ ] Selected slides added at end of presentation
   - [ ] Added slides appear immediately in edit view

5. **Save Operation:**
   - [ ] Save button triggers loading state
   - [ ] API call successful
   - [ ] Database updated with all changes (add/remove/reorder)
   - [ ] Page refreshes with new data
   - [ ] Returns to normal mode

6. **Cancel Operation:**
   - [ ] Cancel button restores original state
   - [ ] All changes discarded (added/removed/reordered)
   - [ ] Returns to normal mode
   - [ ] No API call made

7. **Edge Cases:**
   - [ ] Empty presentation handling
   - [ ] Single slide presentation
   - [ ] Adding duplicate slide (should be filtered)
   - [ ] Network error during save
   - [ ] Permission changes during edit session

## Future Enhancements

The following features could be added in future iterations:

- **Undo/Redo:** Within edit mode
- **Bulk Operations:** Select multiple slides for removal/reordering
- **Slide Preview:** Quick preview before adding
- **Drag to Insert:** Drag slides to specific position instead of always appending
- **Slide Metadata:** Show more slide information in add modal
- **Recent Slides:** Show recently used slides first
- **Favorites:** Mark slides as favorites for quick access
- **Confirmation Dialog:** When navigating away with unsaved changes
- **Change Summary:** Show what changed before saving
- **Auto-save:** Periodic auto-save to prevent data loss
