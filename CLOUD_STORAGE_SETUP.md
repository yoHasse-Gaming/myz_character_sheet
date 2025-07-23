# Cloud Storage Integration Setup Guide - NOT TESTED!!!!

## Overview

Your Mutant: Year Zero character sheet now supports cloud storage integration with both Google Drive and OneDrive, similar to how draw.io works. This allows users to save and sync their character sheets across devices.

## Prerequisites

### For Google Drive Integration

1. **Google Cloud Console Setup**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable the Google Drive API
   - Create credentials (OAuth 2.0 Client ID)
   - Add your domain to authorized JavaScript origins
   - Add your domain + `/` to authorized redirect URIs

2. **Update Configuration**:
   ```typescript
   // In src/lib/utils/googleDriveIntegration.ts
   const googleDriveConfig: GoogleDriveConfig = {
       apiKey: 'YOUR_GOOGLE_API_KEY',        // Your Google API key
       clientId: 'YOUR_GOOGLE_CLIENT_ID',    // Your OAuth client ID
       discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
       scope: 'https://www.googleapis.com/auth/drive.file'
   };
   ```

### For OneDrive Integration

1. **Azure AD App Registration**:
   - Go to [Azure Portal](https://portal.azure.com/)
   - Navigate to "Azure Active Directory" > "App registrations"
   - Create a new registration
   - Add your domain to redirect URIs
   - Note down the Application (client) ID

2. **Update Configuration**:
   ```typescript
   // In src/lib/utils/oneDriveIntegration.ts
   const oneDriveConfig: OneDriveConfig = {
       clientId: 'YOUR_AZURE_CLIENT_ID',     // Your Azure AD app client ID
       authority: 'https://login.microsoftonline.com/common',
       redirectUri: window.location.origin,  // Your app's URL
       scopes: ['Files.ReadWrite', 'User.Read']
   };
   ```

## Features

### 1. **Automatic Folder Creation**
- Creates a "MYZ Character Sheets" folder in the user's cloud storage
- Organizes all character sheets in one location

### 2. **File Naming Convention**
- Files are saved as: `{CharacterName}_{CharacterID}.json`
- Example: `Rust_a1b2c3d4-e5f6-7890-abcd-ef1234567890.json`

### 3. **Sync Options**
- **Manual Sync**: User can manually save/load from cloud
- **Auto Sync**: Automatically sync when local changes are made
- **Local + Cloud**: Always saves locally first, then syncs to cloud

### 4. **User Experience**
- Sign in once, stay connected
- List all character sheets from cloud storage
- Load any character with one click
- Visual indicators for sync status

## Usage

### 1. **Enable Cloud Storage**
Users can access cloud storage through the Storage Controls modal:
- Click the storage/settings button
- Choose between Google Drive or OneDrive
- Sign in to their preferred service
- Start syncing characters

### 2. **Saving Characters**
- Characters automatically save to local storage
- If cloud sync is enabled, also saves to cloud
- No user action required for auto-sync

### 3. **Loading Characters**
- View list of cloud-stored characters
- Click "Load" to download and apply character data
- Automatically updates local storage

### 4. **Managing Characters**
- Delete characters from cloud storage
- Refresh character list from cloud
- Sign out to stop cloud syncing

## Technical Implementation

### 1. **Storage Architecture**
```
Local Storage (Primary)
    ↕️
Cloud Storage (Sync)
    - Google Drive API
    - Microsoft Graph API
```

### 2. **File Structure**
```json
{
    "id": "character-uuid",
    "name": "Character Name",
    "occupation": "Occupation",
    "savedAt": "2025-01-01T12:00:00.000Z",
    "source": "google-drive" | "onedrive",
    // ... all character data
}
```

### 3. **Security**
- OAuth 2.0 authentication
- Limited scope permissions (only app-created files)
- No server-side storage of credentials
- Client-side only implementation

## Development Notes

### 1. **Testing Locally**
- Use `http://localhost:5173` for local development
- Add localhost to OAuth redirect URIs
- Both providers support localhost for testing

### 2. **Production Deployment**
- Update OAuth configurations with production domain
- Ensure HTTPS is enabled for production
- Test authentication flows thoroughly

### 3. **Error Handling**
- Graceful fallback to local storage if cloud fails
- User-friendly error messages
- Retry mechanisms for transient failures

## Environment Variables (Optional)

You can use environment variables for configuration:

```env
VITE_GOOGLE_API_KEY=your_google_api_key
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_AZURE_CLIENT_ID=your_azure_client_id
```

Then update the configuration files to use these:

```typescript
const googleDriveConfig: GoogleDriveConfig = {
    apiKey: import.meta.env.VITE_GOOGLE_API_KEY || 'YOUR_API_KEY',
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_CLIENT_ID',
    // ...
};
```

## Browser Compatibility

- **Google Drive**: Supports all modern browsers
- **OneDrive**: Supports all modern browsers with ES6+ support
- **Fallback**: Always falls back to localStorage if cloud storage fails

## File Limits

- **Google Drive**: 100MB per file (more than sufficient for JSON)
- **OneDrive**: 250MB per file (more than sufficient for JSON)
- **Character Files**: Typically <100KB each

## Privacy & Data

- Character data is stored in user's personal cloud storage
- No data passes through your servers
- Users maintain full control over their data
- Can export/import JSON files for backup/migration
