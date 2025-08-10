# PowerPoint Upload Feature

This document describes the PowerPoint upload feature that allows users to upload .pptx files to their organization's folder structure.

## Overview

The upload feature provides a complete user interface for uploading PowerPoint presentations (.pptx files) with proper validation, progress tracking, and error handling.

## Files Created/Modified

### New Components

- `src/components/PowerPointUpload.tsx` - Core upload component with file selection, validation, and upload logic
- `src/components/UploadModal.tsx` - Modal dialog wrapper for the upload component
- `src/components/FolderViewClient.tsx` - Client-side wrapper for folder views with upload functionality
- `src/lib/supabase/client.ts` - Client-side Supabase client utility

### Modified Files

- `src/app/[organization]/[...slug]/page.tsx` - Updated to use the new FolderViewClient component
- `src/components/FolderContentList.tsx` - Added upload functionality to folder cards

## Features

### File Upload

- **File Type Validation**: Only accepts .pptx files
- **File Size Validation**: Maximum 50MB file size limit
- **MIME Type Checking**: Validates file type beyond just extension
- **Progress Tracking**: Real-time upload progress with percentage and progress bar
- **Error Handling**: Comprehensive error messages for validation and upload failures

### User Interface

- **Upload Button**: Primary upload button in folder view header
- **Folder-Specific Upload**: Upload action available in individual folder dropdown menus
- **Modal Interface**: Clean modal dialog for upload process
- **File Selection**: Drag-and-drop style file selector with clear instructions
- **Status Feedback**: Visual feedback for upload states (uploading, success, error)

### Integration

- **Authentication**: Uses Supabase auth to get current user ID
- **API Integration**: Properly formatted API calls with query parameters
- **Database Integration**: Works with existing organization, folder, and user structure
- **State Management**: Proper state handling and cleanup

## API Requirements

### Endpoint

```
POST {PRESTR_API_URL}/api/upload
```

### Query Parameters

- `organization_id`: Current user's organization ID
- `folder_id`: Target folder ID for upload
- `user_id`: Current authenticated user ID

### Request

- **Method**: POST
- **Content-Type**: multipart/form-data
- **Body**: FormData with file field containing the .pptx file

### Response

- **Success**: HTTP 2xx with optional JSON response
- **Error**: HTTP 4xx/5xx with JSON error message

## Environment Variables

Required environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_PRESTR_API_URL=your_api_base_url  # Optional, defaults to relative paths
```

## Usage

### For End Users

1. **Navigate to a folder** in your organization
2. **Click the "Upload" button** in the folder header
3. **Select a .pptx file** using the file dialog
4. **Monitor upload progress** via the progress bar
5. **See success confirmation** when upload completes
6. **View uploaded file** in the folder contents

### Upload from Folder Actions

1. **Click the dropdown menu** on any folder card
2. **Select "Upload content"** from the menu
3. **Follow the same upload process** as above

## Technical Implementation

### File Validation

```typescript
// Validates file extension, size, and MIME type
const validateFile = (file: File): string | null => {
  // .pptx extension check
  // 50MB size limit
  // MIME type validation
}
```

### Progress Tracking

```typescript
// XMLHttpRequest with progress events
xhr.upload.addEventListener('progress', (event) => {
  const percentage = Math.round((event.loaded / event.total) * 100)
  // Update UI with progress
})
```

### Authentication

```typescript
// Get current user from Supabase
const {
  data: { user },
} = await supabase.auth.getUser()
const userId = user.id
```

## Security Considerations

- **File Type Validation**: Multiple layers of file type checking
- **Size Limits**: 50MB maximum file size to prevent abuse
- **Authentication Required**: Users must be logged in to upload
- **Organization Boundaries**: Users can only upload to their organization
- **Folder Permissions**: Upload respects existing folder access controls

## Error Handling

The system handles various error scenarios:

- **Authentication Errors**: User not logged in or session expired
- **Validation Errors**: Invalid file type, size too large, etc.
- **Network Errors**: Connection issues, timeouts
- **Server Errors**: API errors, database issues
- **Permission Errors**: Insufficient permissions for target folder

## Performance Considerations

- **Progress Feedback**: Real-time upload progress prevents user confusion
- **File Size Limits**: 50MB limit balances functionality with performance
- **Async Processing**: Non-blocking upload with proper UI feedback
- **State Cleanup**: Proper cleanup of upload state and file references

## Future Enhancements

Possible improvements:

- **Drag and Drop**: Direct file drop onto folder areas
- **Batch Upload**: Multiple file upload support
- **Resume Capability**: Resume interrupted uploads
- **Preview Generation**: Automatic thumbnail generation
- **Metadata Extraction**: Extract presentation metadata
- **Conversion Support**: Support for .ppt files with conversion
- **Cloud Storage**: Direct upload to cloud storage services

## Browser Compatibility

- **Modern Browsers**: Supports all modern browsers with XMLHttpRequest Level 2
- **File API**: Requires File API support for file validation
- **FormData**: Uses FormData for multipart uploads
- **Progress Events**: Requires XMLHttpRequest progress event support
