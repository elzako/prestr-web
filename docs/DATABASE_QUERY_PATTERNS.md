# Database Query Patterns

## Supabase Usage Overview
- Application code uses the Supabase JS client via utility wrappers in `src/lib/supabase/client.ts` and `src/lib/supabase/server.ts`.
- Queries are concentrated in server actions (`src/lib`), the authenticated route handler (`src/app/auth/confirm/route.ts`), and the organization catch-all page (`src/app/[organization]/[[...slug]]/page.tsx`).

## Table Query Patterns

### `folders`
- **Read**: Organization bootstrap and nested browsing pull folder metadata in `src/app/[organization]/[[...slug]]/page.tsx:125` and `src/app/[organization]/[[...slug]]/page.tsx:214`; folder lookups and breadcrumb assembly reuse `src/lib/folder-actions.ts:144` and `src/lib/folder-actions.ts:490`; search results hydrate `full_path` via `src/lib/search-actions.ts:217`.
- **Write**: Project lifecycle server actions create/update/soft-delete rows at `src/lib/project-actions.ts:143`, `src/lib/project-actions.ts:275`, and `src/lib/project-actions.ts:354`; nested folder CRUD issues `insert`/`update`/soft-delete calls in `src/lib/folder-actions.ts:246`, `src/lib/folder-actions.ts:380`, and `src/lib/folder-actions.ts:450`.
- **Guards**: Existence and uniqueness checks live in `src/lib/project-actions.ts:117`, `src/lib/project-actions.ts:235`, `src/lib/folder-actions.ts:208`, and `src/lib/folder-actions.ts:320`; child-content checks combine folder/presentation/slide probes at `src/lib/folder-actions.ts:90`, `src/lib/folder-actions.ts:102`, and `src/lib/folder-actions.ts:114`.

### `presentations`
- **Read**: Folder browsing and slug resolution select presentation records in `src/app/[organization]/[[...slug]]/page.tsx:223` and `src/app/[organization]/[[...slug]]/page.tsx:320`; folder delete guards ping `src/lib/folder-actions.ts:102`.
- **Write**: Client actions manage presentation creation, updates, and slide payloads in `src/lib/presentation-actions.ts:86`, `src/lib/presentation-actions.ts:119`, `src/lib/presentation-actions.ts:179`, and `src/lib/presentation-actions.ts:227`.

### `slides`
- **Read**: Folder listings and direct slide routes query `slides` in `src/app/[organization]/[[...slug]]/page.tsx:232` and `src/app/[organization]/[[...slug]]/page.tsx:271`; delete guards reuse `src/lib/folder-actions.ts:114`.
- **Write**: Client edits persist slide metadata through `src/lib/slide-actions.ts:25`.

### `user_organization_roles`
- **Read**: Role hydration for page scaffolding and auth flows occurs at `src/app/[organization]/[[...slug]]/page.tsx:98`, `src/app/auth/confirm/route.ts:22`, `src/lib/auth-actions.ts:266`, and `src/lib/organization-server-actions.ts:35`.
- **Permission checks**: Server actions enforce org-level permissions in `src/lib/folder-actions.ts:27`, `src/lib/organization-actions.ts:24`, `src/lib/presentation-actions.ts:37`, `src/lib/presentation-actions.ts:200`, and `src/lib/project-actions.ts:36`.

### `user_folder_roles`
- **Read**: User role hydration pulls folder-scoped roles at `src/app/[organization]/[[...slug]]/page.tsx:103`.
- **Permission checks**: Presentation authoring verifies per-folder access in `src/lib/presentation-actions.ts:47` and `src/lib/presentation-actions.ts:210`.

### `organizations`
- **Read**: Organization bootstrap, folder context, and project setup select the table in `src/app/[organization]/[[...slug]]/page.tsx:55`, `src/lib/folder-actions.ts:45`, and `src/lib/project-actions.ts:54`.
- **Write**: Profile updates use `update` with optimistic checks in `src/lib/organization-actions.ts:81`.
- **Guards**: Name availability and similar checks live in `src/lib/organization-actions.ts:113`.

### `user_profiles`
- **Read**: User profile hydration pulls rows in `src/lib/auth-actions.ts:223`.
- **Write**: Profile metadata updates persist changes via `src/lib/auth-actions.ts:325`.

## Stored Procedures (RPC)
- `get_folder_id_by_full_path`: resolves dynamic folder paths to IDs in `src/app/[organization]/[[...slug]]/page.tsx:152`.
- `get_root_folder_id`: enforces permission checks for nested content in `src/app/[organization]/[[...slug]]/page.tsx:172`, `src/lib/presentation-actions.ts:27`, and `src/lib/presentation-actions.ts:190`.
- `get_subfolder_ids_including_self`: enumerates descendant folders for filtering in `src/app/[organization]/[[...slug]]/page.tsx:191`.
- `get_effective_visibility`: determines inherited visibility before uploads in `src/components/PowerPointUpload.tsx:130`.

## Indexing Notes
- `folders`: composite indexes on `(organization_id, parent_id, deleted_at)` and a partial index for `parent_id IS NULL` support project/folder discovery; consider unique or covering `(organization_id, parent_id, folder_name)` for duplicate guards.
- `presentations` / `slides`: compound indexes on `(parent_id, deleted_at, presentation_name)` and `(parent_id, deleted_at, slide_name)` improve fetches and name-based lookups.
- `user_organization_roles`: ensure `(organization_id, user_id)` and `(user_id, user_role)` indexes exist to serve permission and owner queries.
- `user_folder_roles`: index `(folder_id, user_id)` (and optionally `(user_id, folder_id)`) for bidirectional membership lookups.
- `organizations`: uniqueness on `organization_name` aligns with expectation of single record lookups.

Leverage `EXPLAIN` on the Supabase/Postgres side to confirm chosen indexes satisfy the observed access paths.
