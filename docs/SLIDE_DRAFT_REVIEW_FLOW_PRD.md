# PRD: Slide Draft Review Flow

|   Field | Value                  |
| ------: | ---------------------- |
|  Status | New                    |
|  Author | Gemini                 |
|    Date | 2025-10-25             |
| Feature | Slide Draft Management |

## 1. Overview

This document outlines the frontend UI/UX requirements for a new feature that allows privileged users (Org Admins, Project Admins, Project Contributors) to manage unpublished drafts of slides.

When a slide has a draft, eligible users will see an indicator in the **Slide View**. They can then enter a **Draft Review** mode, which displays a side-by-side comparison of the published slide and the draft. From this view, the user can choose to either publish the draft (making it the new published version) or discard the draft (deleting the changes).

## 2. Problem Statement

Currently, when a user saves a draft of a slide, there is no visual indication in the main Slide View that this draft exists. This creates a disconnect between the saved state and the published state. Privileged users who need to approve or manage content have no straightforward way to:

- Know that an unpublished draft exists.
- Compare the draft's changes against the currently published version.
- Take action to either publish or discard these pending changes.

This feature introduces a clear and simple workflow to resolve this ambiguity.

## 3. Target Audience & Permissions

This feature is only visible to the following user roles:

- Organization Owner/Admin
- Project Admin
- Project Contributor

All other user roles will not see any of the UI elements described in this PRD and will continue to only see the published version of the slide.

## 4. User Stories

- **US-1 (Indication):** As a project contributor, when I look at a slide in the **Slide View** that has an unpublished draft, I want to see a clear visual indicator so I know that what I'm seeing might not be the latest saved version.
- **US-2 (Review Action):** As a project contributor, I want to be able to click a button or link to **Review Draft** from the **Slide View**.
- **US-3 (Side-by-Side):** As a project contributor, when I review a draft, I want to see the currently published slide and the draft slide side-by-side so I can accurately compare the changes.
- **US-4 (Publish):** As a project contributor, after reviewing the draft, I want a clear **Publish Draft** button to make the draft version the new published version.
- **US-5 (Discard):** As a project contributor, after reviewing the draft, I want a clear **Discard Draft** button to delete the draft and keep the currently published version as-is.

## 5. UI/UX Requirements

This feature is broken into two main components:

1. **Slide View Indicator** (Modifications to the current view)
2. **Draft Review Modal** (A new view)

### 5.1. Component: Slide View Indicator

This section describes the changes to the existing **Slide View**

**Trigger:**

- User is one of the target roles.
- The slide data object for the current slide contains a `draft_object_id` that is not null.

**UI Changes:**

- A new button labeled **Review Draft** will be added to the top-right action icon group, placed to the left of the existing **Edit** (pencil) icon.

**Styling:**

- This button should be visually distinct to indicate a pending action.
- It should contain both an icon (e.g., a “diff” or “review” icon) and the text **Review Draft**.
- A subtle warning color (e.g., an amber border or background) is recommended to draw the user's attention.

**Tooltip:**

- On hover, display: _“This slide has an unpublished draft. Click to review changes.”_

**Action:**

- Clicking this button will open the **Draft Review Modal** (see §5.2).

**Conceptual Mockup:**

- Current Icons (Right): `[Edit (pencil)]`, `[Lightbox (maximize)]`
- New Icons (Right): `[Review Draft Button]`, `[Edit (pencil)]`, `[Lightbox (maximize)]`

### 5.2. View: Draft Review Modal

This is a new modal dialog that appears when the **Review Draft** button is clicked.

**Layout:**

- **Modal Title:** `Review Draft: $$Slide Name$$`
- **Content Area:** Split into two vertical, side-by-side columns of equal width.

**Left Column:**

- **Header:** _Currently Published_
- **Content:** A read-only rendering of the published slide content.

**Right Column:**

- **Header:** _Unpublished Draft_ (add a **Draft** chip/badge next to the header for clarity)
- **Content:** A read-only rendering of the draft slide content (loaded via `draft_object_id`).

**Modal Footer (Action Bar):** Three right-aligned buttons.

1. **Publish Draft (Primary Action)**
   - **Label:** _Publish Draft_
   - **Styling:** Primary action button (e.g., solid green or blue).
   - **Action:**
     - On click, show a confirmation dialog:
       - **Title:** _Publish Draft?_
       - **Body:** _Are you sure you want to publish this draft? This will replace the currently published slide._
       - **Actions:** _Cancel_, _Publish_

     - If **Publish** is confirmed, call:
       - `POST /api/slides/publish/{slideId}`

     - **On Success:**
       - Close the Draft Review modal.
       - Refresh the Slide View. The `draft_object_id` will be null, so the **Review Draft** button will no longer be visible.
       - Show success toast: _“Draft published successfully.”_

     - **On Error:**
       - Show error toast: _“Failed to publish draft. Please try again.”_

2. **Discard Draft (Destructive Action)**
   - **Label:** _Discard Draft_
   - **Styling:** Destructive action button (e.g., red outline or text).
   - **Action:**
     - On click, show a confirmation dialog:
       - **Title:** _Discard Draft?_
       - **Body:** _Are you sure you want to discard this draft? All draft changes will be permanently lost._
       - **Actions:** _Cancel_, _Discard_

     - If **Discard** is confirmed, call:
       - `POST /api/slides/discard/{slideId}` _(or `DELETE` if specified by backend)_

     - **On Success:**
       - Close the Draft Review modal.
       - Refresh the Slide View. The `draft_object_id` will be null, so the **Review Draft** button will no longer be visible.
       - Show success toast: _“Draft discarded.”_

     - **On Error:**
       - Show error toast: _“Failed to discard draft. Please try again.”_

3. **Cancel (Standard Action)**
   - **Label:** _Cancel_
   - **Styling:** Secondary/ghost button.
   - **Action:** Close the modal. No changes are made.

## 6. Out of Scope

- **Backend API Implementation:** The development of the `/publish` and `/discard` endpoints is out of scope for this PRD.
- **Slide Editing UI:** This flow does not cover the slide editing experience itself (what happens when the **Edit** pencil icon is clicked).
- **Diff Highlighting:** This v1 design does not require automatically highlighting the specific differences (a “text diff”) between the two versions. The feature is a simple side-by-side visual comparison.
- **Conflict Merging:** This flow does not support merge conflicts. It is a simple “replace all” (Publish) or “delete all” (Discard) workflow.
