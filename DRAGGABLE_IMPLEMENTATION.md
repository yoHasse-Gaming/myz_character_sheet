# Draggable & Resizable Papers Implementation

## Overview
Implemented InteractJS to make papers both draggable and resizable within tabs. This allows users to create completely custom layouts by moving and sizing papers to their preference.

## Changes Made

### 1. Package Installation
- Installed `interactjs` package for drag and drop functionality
- InteractJS includes its own TypeScript definitions

### 2. Skills.svelte Component Updates

#### Script Changes
- Added `import interact from 'interactjs'`
- Added `onMount()` lifecycle hook to initialize InteractJS
- Configured draggable and resizable behavior with:
  - Move listeners to update element position
  - Resize listeners to update element size
  - Data attributes to track position (data-x, data-y)
  - Minimum size constraints to prevent papers from becoming too small
  - Debug logging to troubleshoot initialization

### 3. CharacterTab.svelte Component Updates

#### Script Changes
- Added `import interact from 'interactjs'` and `onMount` from 'svelte'
- Added InteractJS initialization for both draggable and resizable character papers
- Configured resize behavior with all edges enabled (top, bottom, left, right)
- Set minimum size constraints (250x120px for character papers)
- Debug logging for troubleshooting

#### HTML Structure Changes
- Completely restructured layout to move all labels inside torn paper wrappers
- Added drag handles with grip dots icon to each field
- Added `character-paper` class to torn-input-wrapper elements
- Added `data-x="0" data-y="0"` attributes for position tracking
- Changed from grid/card layout to flexible paper container
- Fields now include: Name, Job/Syssla, Face/Ansikte, Body/Kropp, Clothes/Kläder

#### CSS Changes
- Added comprehensive styling for draggable and resizable character papers
- Added visible borders on hover to indicate resize areas
- Enhanced shadow effects on hover/active/resize states
- Responsive design for mobile devices
- Styled headers with labels and drag handles
- Made inputs and textareas adapt to container size

#### HTML Structure Changes
- Moved skill names inside the torn paper wrapper (in header section)
- Added drag handle with grip dots icon
- Added `skill-paper` class to torn-input-wrapper elements
- Added `data-x="0" data-y="0"` attributes for position tracking
- Restructured skill controls to separate header (name + drag handle) from controls (info button + input)

#### CSS Changes
- Changed `.skills-tab` from grid to block layout with relative positioning
- Made skill items `position: absolute` for free positioning
- Added `.skill-paper` styles for drag and resize behavior:
  - `cursor: move`
  - `user-select: none`
  - Enhanced shadow effects on hover/active/resize
  - Visible borders on hover to indicate resize areas
- Added minimum size constraints via CSS
- Added `.skill-header` with border separator
- Added `.skill-drag-handle` with opacity transitions
- Repositioned optional skills section as fixed floating panel
- Updated responsive styles for the new layout

### 4. Persistent Layout State Management

#### Character Sheet State Integration
- Added `paperLayouts` object to character sheet state to store position and size data
- Created helper functions in characterActions for saving, retrieving, and clearing paper layouts
- Each paper has a unique `data-paper-id` attribute for identification
- Layout data is organized by tab ('characterTab', 'skillsTab') and paper ID
- Position and size are restored automatically when components mount
- Changes are saved immediately during drag/resize operations

#### Persistent Layout Implementation
- **CharacterTab.svelte**: All character fields (Name, Job, Face, Body, Clothes) persist layout
- **Skills.svelte**: All skill papers (both core and optional) persist layout
- **Cross-tab persistence**: Layout is maintained when switching between tabs
- **Unique IDs**: Core skills use `skill-{index}`, optional skills use `optional-skill-{skill.id}`
- **State sync**: Position and size changes are immediately saved to application state

### 6. Reset Layout Functionality

#### Reset Buttons
- **Character Tab**: Red "Återställ layout" button in top-right corner
- **Skills Tab**: Red "Återställ layout" button in controls section alongside "Lägg till valfria färdigheter"
- **Functionality**: Clears all saved positions and sizes, returns papers to default grid layout
- **Visual Design**: Red gradient buttons with reset icon, hover effects, and responsive design
- **Immediate Effect**: Papers instantly return to their initial positions and sizes

#### Implementation Details
- Uses existing `characterActions.clearPaperLayouts(tabName)` function
- Resets DOM elements: clears transforms, data attributes, and inline styles
- Tab-specific reset: only affects the current tab's papers
- Console logging for debugging reset operations

### 7. Key Features

#### Draggable & Resizable Behavior
- All papers (both character fields and skills) are draggable and resizable
- **Header-only dragging**: Papers can only be dragged by clicking and dragging from their headers (character-header/skill-header)
- **Free movement** anywhere within the tab area - no restrictions
- **All-edge resizing** - resize from any edge or corner
- **Minimum size constraints** prevent papers from becoming unusably small
- Visual feedback with enhanced shadows during drag/resize operations
- Smooth transitions for hover effects
- Z-index management ensures active papers appear on top
- **Improved UX**: Clear visual distinction between draggable headers and interactive content

#### Visual Improvements
- Paper borders become visible on hover to indicate resize areas
- Skill names and character labels prominently displayed in paper headers
- **Interactive headers**: Headers have distinct styling with move cursor and hover effects
- **Draggable area indication**: Only headers are draggable, with clear visual feedback
- Floating optional skills control panel
- Better visual hierarchy with separated headers and controls
- **Responsive textareas**: Textareas fill available space and resize with containers
- Responsive design considerations
- **Reset Layout Buttons**: Red reset buttons in each tab to restore default positions and sizes

## Testing & Debugging
- Development server runs on `http://localhost:5175/`
- **Character Tab**: All character fields (Name, Job, Face, Body, Clothes) are draggable and resizable papers with persistent layout
- **Skills Tab**: All skill papers (both core and optional) are draggable and resizable with persistent layout
- **Header-only dragging**: Click and drag only from the header area (with labels and drag handles) to move papers
- **Textarea sizing**: Textareas properly fill available space and resize with the container
- **Persistent Layout**: Paper positions and sizes are maintained when switching between tabs
- **Reset Functionality**: Click red "Återställ layout" buttons to restore default positions
- **Free Movement**: Papers can be dragged anywhere within the tab area - no restrictions!
- **Resize Functionality**: 
  - Hover over paper edges to see resize cursors
  - Drag from any edge or corner to resize
  - Minimum sizes prevent papers from becoming too small
  - Character papers: minimum 250x120px
  - Skill papers: minimum 200x100px
- Open browser console to see debug logs confirming InteractJS initialization and layout restoration
- Debug logs show: "Initializing InteractJS for..." and "Found X papers"
- Papers start with initial grid positions but can be moved and resized anywhere
- Torn paper background effects are preserved
- Z-index management ensures dragged/resized papers appear on top
- Layout restoration shows "Restoring layout for [paper-id]" messages in console
- Reset operations show "Layout reset to defaults" messages in console

## Troubleshooting
If dragging or resizing doesn't work:
1. Check browser console for debug logs
2. Ensure you're on the correct tab (Character tab for name/job fields, Skills tab for skills)
3. Try clicking and dragging on the paper area, not just the input fields
4. Look for "Found X papers" in console - should be > 0
5. Try dragging from the header area with the label and drag handle
6. For resizing: hover near the edges of papers to see resize cursors
7. For resizing: try dragging from the visible border areas that appear on hover

If persistent layout doesn't work:
1. Check console for "Restoring layout for [paper-id]" messages
2. Ensure papers have unique `data-paper-id` attributes
3. Verify the correct tab identifier is used ('characterTab', 'skillsTab')
4. Try moving a paper, switching tabs, and switching back to test persistence

## Next Steps
This implementation serves as a proof of concept. If the draggable behavior is well-received, it can be extended to:
- Character tab elements (name, concept, occupation, etc.)
- Equipment items
- Talent and mutation cards
- Ability score papers

## Technical Notes
- InteractJS modifiers restrict movement to parent container
- Position is tracked via data attributes (data-x, data-y)
- CSS transforms are used for visual positioning
- Existing torn paper effects are maintained
- Responsive design considerations included
- **Shared CSS Classes**: Common draggable functionality uses shared classes:
  - `.draggable-paper`: Base paper styling for all draggable elements
  - `.paper-header`: Shared header styling for draggable areas
  - `.paper-label`: Shared label styling for paper titles
  - `.paper-drag-handle`: Shared drag handle styling
  - `.paper-content`: Shared content container styling
  - `.paper-input` / `.paper-textarea`: Shared input/textarea styling
- **Component-specific classes**: Only minimum required styling remains in components
- **Code reduction**: Eliminated ~150 lines of duplicate CSS between CharacterTab and Skills
