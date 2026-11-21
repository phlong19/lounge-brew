# Blog management

Use `/admin/blogs` for the existing `articles` table. Active editors and admins can list, create, read, update and permanently delete articles. Existing RLS policies remain in force. Deleting a post queues its unused registered images for cleanup.

API: GET/POST `/api/admin/blogs`; GET/PATCH/DELETE `/api/admin/blogs/[uuid]`. List pages contain 20 summaries. PATCH accepts full editable content plus expectedUpdatedAt; DELETE requires expectedUpdatedAt. Concurrent changes return 409. Duplicate slugs return 409. Mutations require same-origin validation and staff authorization; HTML and image URLs use the owned sanitizer/allowlist.

Vietnamese title and slug are required. English is optional. Drafts use `status = draft` and can be incomplete. Ready posts with a null publication date remain hidden; future publication dates remain scheduled. Cover and inline images upload with purpose blog and use the R2 blogs/ prefix. Event images use events/. Prefixes are object keys, not separately created folders. Existing editorial/ and Supabase URLs remain readable.

Install the app baseline before testing uploads. Environment secrets must not be inspected or printed during setup or QA.
