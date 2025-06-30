# 💾 Storage System Documentation

## Overview

The Mutant: Year Zero character sheet now includes a comprehensive storage system that provides multiple ways to save and backup your character data:

1. **🦉 Owlbear Rodeo Integration** - Automatic sync when used as an Owlbear extension
2. **🗄️ localStorage Failsafe** - Browser-based storage that persists between sessions
3. **📄 JSON Export/Import** - Portable character sheet files
4. **🔄 Auto-Save** - Automatic background saving every 5 seconds (configurable)

## Features

### ✅ **Smart Universal Storage**
- Automatically saves to both Owlbear (when available) and localStorage
- Falls back gracefully when Owlbear is not available
- Provides seamless experience regardless of environment

### ✅ **localStorage Failsafe**
- Works in any browser environment
- Persists data even when not using Owlbear Rodeo
- Automatic cleanup and error handling
- Configurable storage key

### ✅ **JSON Export/Import**
- Export character sheets as portable JSON files
- Import previously exported character sheets
- Includes metadata (export date, version info)
- Compatible across different sessions and devices

### ✅ **Auto-Save System**
- Configurable auto-save intervals (1-300 seconds)
- Background saving without user intervention
- Saves to both localStorage and Owlbear simultaneously
- Can be started/stopped on demand

## Usage Examples

### Basic Integration

```typescript
import { useOwlbearSync, useLocalStorage } from './lib/owlbear-integration.js';

// Define your character data getter
const getCharacterData = () => ({
    name: character.name,
    baseAbilities: character.baseAbilities,
    skills: character.skills,
    conditions: character.conditions
});

// Initialize utilities
const owlbearSync = useOwlbearSync(getCharacterData);
const localStorage = useLocalStorage(getCharacterData);
```

### Smart Save/Load (Recommended)

```typescript
// Save to best available storage (Owlbear + localStorage)
await owlbearSync.saveUniversal();

// Load from best available storage (Owlbear first, localStorage fallback)
const data = await owlbearSync.loadUniversal();
if (data) {
    // Apply loaded data to your character
    character.name = data.name;
    character.baseAbilities = data.baseAbilities;
    // ... other properties
}
```

### Auto-Save

```typescript
// Start auto-save (saves every 5 seconds by default)
owlbearSync.startAutoSave();

// Configure custom interval (10 seconds)
localStorage.configureStorage({ autoSaveInterval: 10000 });

// Stop auto-save
owlbearSync.stopAutoSave();
```

### JSON Export/Import

```typescript
// Export character sheet
localStorage.exportJSON('my-character.json');

// Import character sheet
try {
    const importedData = await localStorage.importJSON();
    if (importedData) {
        // Apply imported data
        character.name = importedData.name;
        // ... other properties
    }
} catch (error) {
    console.error('Import failed:', error);
}
```

### localStorage Only

```typescript
// Save to localStorage
localStorage.save();

// Load from localStorage
const data = localStorage.load();

// Clear localStorage
localStorage.clear();
```

## Configuration Options

```typescript
interface StorageOptions {
    useLocalStorage: boolean;      // Enable/disable localStorage
    autoSaveInterval: number;      // Auto-save interval in milliseconds
    storageKey: string;           // localStorage key name
}

// Configure storage
localStorage.configureStorage({
    autoSaveInterval: 10000,      // 10 seconds
    storageKey: 'my-custom-key'
});
```

## Storage Data Format

```json
{
    "name": "Character Name",
    "baseAbilities": [...],
    "skills": [...],
    "conditions": {...},
    "lastUpdated": 1672531200000,
    "version": "1.0",
    "exportedAt": "2025-06-30T10:30:00.000Z"
}
```

## Using the StorageControls Component

Add the pre-built StorageControls component to your character sheet:

```svelte
<script>
    import StorageControls from './lib/components/StorageControls.svelte';
</script>

<StorageControls />
```

This provides a complete UI for:
- 🔄 Auto-save toggle and interval configuration
- 💾 Smart save/load (Owlbear + localStorage)
- 🗄️ localStorage operations (save, load, clear)
- 📄 JSON export/import with file picker
- 📊 Real-time status messages

## Error Handling

The storage system includes comprehensive error handling:

- **SSR Safety**: All browser-specific operations are wrapped in browser checks
- **Graceful Fallbacks**: Falls back to localStorage when Owlbear is unavailable
- **Error Logging**: All errors are logged with descriptive messages
- **User Feedback**: Storage operations provide status messages
- **Data Validation**: Imported data is validated before application

## Best Practices

### 1. **Always Use Universal Methods**
```typescript
// ✅ Good - Uses best available storage
await owlbearSync.saveUniversal();

// ❌ Avoid - Only uses one storage method
owlbearSync.syncNow();
```

### 2. **Enable Auto-Save**
```typescript
// ✅ Good - Never lose work accidentally
owlbearSync.startAutoSave();
```

### 3. **Handle Import Errors**
```typescript
// ✅ Good - Robust error handling
try {
    const data = await localStorage.importJSON();
    if (data) {
        applyCharacterData(data);
    }
} catch (error) {
    showErrorMessage('Import failed: ' + error.message);
}
```

### 4. **Cleanup on Component Destroy**
```typescript
// ✅ Good - Prevents memory leaks
onDestroy(() => {
    owlbearIntegration.cleanup();
});
```

## Browser Compatibility

- **localStorage**: All modern browsers (IE8+)
- **File Export/Import**: Modern browsers with File API support
- **Owlbear SDK**: Chromium-based browsers (as per Owlbear requirements)

## Security Notes

- **localStorage** data is domain-specific and not shared between sites
- **JSON exports** contain all character data - handle files securely
- **No sensitive data** should be stored (passwords, API keys, etc.)
- **Data persistence** varies by browser privacy settings

## Troubleshooting

### Auto-Save Not Working
- Check browser console for errors
- Verify `getCharacterData()` function returns valid data
- Ensure auto-save was started with `startAutoSave()`

### localStorage Quota Exceeded
- Clear old data with `localStorage.clear()`
- Reduce auto-save frequency
- Export important characters to JSON files

### Import/Export Issues
- Verify JSON file format matches expected structure
- Check file permissions and browser file access settings
- Ensure files are not corrupted or modified

### Owlbear Integration Issues
- Verify the app is running inside Owlbear Rodeo
- Check browser console for SDK initialization messages
- Ensure manifest.json is properly configured for Owlbear
