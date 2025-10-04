# Slide Reordering Feature

## Overview

The slide reordering feature allows users with edit permissions to reorder slides within a presentation through an intuitive drag-and-drop interface. Changes are only persisted when explicitly saved, with the option to cancel and restore the original order.

## Implementation Summary

### Components Added/Modified

#### 1. **API Endpoint** - `src/app/api/presentations/[id]/reorder/route.ts`

A new PATCH endpoint that:

- Validates slide data structure
- Checks for duplicate order values
- Verifies user permissions (admin/contributor only)
- Updates the `slides` JSONB column in the presentations table
- Returns the updated presentation data

**Endpoint:** `PATCH /api/presentations/{id}/reorder`

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

#### 2. **Presentation Actions** - `src/lib/presentation-actions.ts`

Added `reorderSlides()` function:

- Client-side function that calls the API endpoint
- Handles errors and returns the response
- Used by the SlideGallery component

#### 3. **SlideGallery Component** - `src/components/SlideGallery.tsx`

Major updates:

- **Props:**
  - `presentationId` and `canEdit`
  - `isReorderMode` - controlled by parent component
  - `onExitReorderMode` - callback to notify parent when exiting reorder mode
- **State Management:**
  - `reorderedSlides` - current slide order during reordering
  - `originalSlides` - backup of original order for cancel operation
  - `isSaving` - loading state during save operation

- **Drag-and-Drop Implementation:**
  - Uses `@dnd-kit/core` and `@dnd-kit/sortable`
  - `DndContext` wraps the slide grid
  - `SortableContext` manages sortable items
  - New `SortableSlide` component for individual draggable slides

- **UI States:**
  - **Normal Mode:** Standard gallery view with lightbox functionality
  - **Reorder Mode:**
    - Control bar displayed with status indicator
    - Slides are draggable with visible drag handles
    - Save/Cancel buttons in control bar
    - Lightbox disabled
    - Visual indicators (cursor changes, hover states)

- **Features:**
  - Real-time visual feedback during dragging
  - Automatic order number updates after each drag
  - Save button calls API and refreshes data
  - Cancel button restores original order and exits reorder mode
  - Loading state with spinner during save

#### 4. **PresentationViewClient Component** - `src/components/PresentationViewClient.tsx`

Major updates:

- **State Management:** Manages `isReorderMode` state
- **Header Buttons:**
  - "Reorder Slides" button (hidden when in reorder mode)
  - "Edit Metadata" button (always visible when user has edit permissions)
  - Both buttons styled consistently with indigo theme
- **Props passed to SlideGallery:**
  - `presentationId={presentation.id}`
  - `canEdit={canEdit}`
  - `isReorderMode={isReorderMode}`
  - `onExitReorderMode={() => setIsReorderMode(false)}`

### Dependencies Installed

```json
{
  "@dnd-kit/core": "^6.3.1",
  "@dnd-kit/sortable": "^10.0.0",
  "@dnd-kit/utilities": "^3.2.2"
}
```

## User Flow

1. **Access Presentation View**
   - User navigates to a presentation (e.g., `/acme/project1/my-presentation.presentation`)
   - If user has edit permissions, "Reorder Slides" and "Edit Metadata" buttons appear in the header

2. **Enter Reorder Mode**
   - User clicks "Reorder Slides" button in the header
   - UI changes:
     - "Reorder Slides" button disappears from header
     - Control bar appears showing "Reorder Mode Active" indicator
     - Slides become draggable (cursor changes to move cursor)
     - Drag handle icons appear on slides
     - Save and Cancel buttons appear in the control bar
     - Lightbox/preview functionality is disabled

3. **Reorder Slides**
   - User drags slides to desired positions
   - Visual feedback:
     - Dragged slide becomes semi-transparent
     - Slide order numbers update immediately
     - Drop position is clearly indicated

4. **Save or Cancel**
   - **Save Option:**
     - User clicks "Save Order" button
     - Loading spinner appears
     - API request sent to update database
     - Page refreshes to show updated order
     - Returns to normal mode
   - **Cancel Option:**
     - User clicks "Cancel" button
     - Local changes discarded
     - Original order restored
     - Returns to normal mode

## Technical Details

### Permissions

- Only users with `admin` or `contributor` folder roles can reorder slides
- Organization owners and admins also have permission
- Permissions are checked on both frontend (UI visibility) and backend (API)

### Data Flow

1. **Initial Load:** Presentation data with slides array loaded from database
2. **Enter Reorder:** Original slides saved to `originalSlides` state
3. **Drag Operation:** `reorderedSlides` state updated with new order
4. **Save:** `reorderedSlides` sent to API → database updated → page refreshed
5. **Cancel:** `originalSlides` copied back to `reorderedSlides` state

### State Management

- **slides (prop):** Original slides from database (immutable)
- **reorderedSlides:** Current working order (modified during drag)
- **originalSlides:** Backup for cancel operation
- **isReorderMode:** Boolean flag for UI state
- **isSaving:** Loading state for async operation

### Keyboard Support

- Drag-and-drop supports keyboard navigation via `KeyboardSensor`
- Coordinates provided by `sortableKeyboardCoordinates` from dnd-kit

## UI/UX Considerations

### Visual Indicators

- **Normal Mode:**
  - Standard cursor
  - Hover effects for preview
  - Click opens lightbox

- **Reorder Mode:**
  - Move cursor on slides
  - Drag handle icons (horizontal lines)
  - Prominent control bar with status indicator
  - Distinct hover effects (stronger border, larger shadow)
  - Disabled lightbox (clicks don't trigger preview)

### Accessibility

- Keyboard navigation supported
- Clear button labels
- Visual status indicators
- Focus states on interactive elements
- ARIA labels where appropriate

### Error Handling

- Alert shown if save fails
- Console logging for debugging
- Graceful fallback to previous state on error
- Loading states prevent duplicate submissions

## Future Enhancements (Out of Scope)

The following features were intentionally excluded from this implementation but could be added:

- Undo/redo functionality within reorder mode
- Multi-slide selection and bulk movement
- Confirmation dialog when navigating away with unsaved changes
- Auto-save functionality
- Real-time collaborative editing indicators
- Slide deletion during reorder mode
- Drag-and-drop across multiple pages/sections

## Testing Recommendations

### Manual Testing Checklist

1. **Permission Tests:**
   - [ ] Reorder controls only visible for users with edit permissions
   - [ ] API rejects requests from unauthorized users

2. **Reorder Mode:**
   - [ ] Clicking "Reorder Slides" enters reorder mode
   - [ ] UI updates correctly (control bar, drag handles, cursors)
   - [ ] Lightbox disabled in reorder mode

3. **Drag Operations:**
   - [ ] Slides can be dragged to new positions
   - [ ] Order numbers update immediately
   - [ ] Visual feedback during drag (opacity, positioning)
   - [ ] Drag works with mouse
   - [ ] Drag works with keyboard

4. **Save Operation:**
   - [ ] Save button triggers loading state
   - [ ] API call successful
   - [ ] Database updated correctly
   - [ ] Page refreshes with new order
   - [ ] Returns to normal mode

5. **Cancel Operation:**
   - [ ] Cancel button restores original order
   - [ ] No API call made
   - [ ] Returns to normal mode

6. **Edge Cases:**
   - [ ] Single slide presentation
   - [ ] Large number of slides (100+)
   - [ ] Network error during save
   - [ ] Permission changes during session

### Automated Testing

Consider adding tests for:

- API endpoint validation logic
- Permission checking
- Slide reordering logic
- State management in SlideGallery component
- Error handling scenarios

## Deployment Notes

- No database migrations required (uses existing JSONB column)
- No environment variables added
- New npm packages included in build
- Production build successful (verified)
- No breaking changes to existing functionality

## Related Files

- `src/app/api/presentations/[id]/reorder/route.ts` - API endpoint
- `src/lib/presentation-actions.ts` - Client-side API wrapper
- `src/components/SlideGallery.tsx` - Main UI component
- `src/components/PresentationViewClient.tsx` - Parent component
- `src/components/PresentationView.tsx` - Server component wrapper
- `package.json` - Updated dependencies
