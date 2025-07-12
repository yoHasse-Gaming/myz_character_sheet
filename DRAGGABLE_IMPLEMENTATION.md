# Draggable & Resizable Papers Implementation

# Draggable & Resizable Papers Implementation

## Overview
Implemented InteractJS to make papers both draggable and resizable within tabs. This allows users to create completely custom layouts by moving and sizing papers to their preference. The implementation includes performance optimizations and header-only dragging for better UX.

## Changes Made

### 1. Package Installation
- Installed `interactjs` package for drag and drop functionality
- InteractJS includes its own TypeScript definitions

### 2. Performance Optimizations
- **Throttled State Updates**: Implemented throttling to reduce state saves during drag/resize to max every 100ms
- **Hardware Acceleration**: Added CSS `transform: translateZ(0)` and `backface-visibility: hidden` for GPU acceleration
- **Final Save on End**: Ensure final position/size is saved when drag/resize operations complete
- **Reduced Console Logging**: Minimized debug output for better performance
- **Content-Aware Resizing**: Dynamic minimum height calculation prevents text from being clipped when resizing

### 3. Skills.svelte Component Updates

#### Script Changes
- Added `import interact from 'interactjs'`
- Added `onMount()` lifecycle hook to initialize InteractJS
- Added throttling function to optimize state update frequency
- Configured draggable and resizable behavior with:
  - Move listeners to update element position
  - Resize listeners to update element size
  - Data attributes to track position (data-x, data-y)
  - Minimum size constraints to prevent papers from becoming too small
  - Header-only dragging using `allowFrom: '.paper-header'`
  - Throttled save during movement, final save on end

### 4. CharacterTab.svelte Component Updates

#### Script Changes
- Added `import interact from 'interactjs'` and `onMount` from 'svelte'
- Added throttling function for performance optimization
- Added InteractJS initialization for both draggable and resizable character papers
- Configured resize behavior with all edges enabled (top, bottom, left, right)
- Set minimum size constraints (250x120px for character papers)
- Header-only dragging implementation
- Performance-optimized state management

### 5. CSS Refactoring & Shared Styles

#### Shared Classes in app.css
- **`.draggable-paper`**: Base styling for all draggable papers with hardware acceleration
- **`.paper-header`**: Consistent header styling with drag cursor and performance optimizations
- **`.paper-label`**: Unified label styling across all papers
- **`.paper-content`**: Flexible content area that adapts to paper size
- **`.paper-input`** & **`.paper-textarea`**: Consistent input styling that fills available space
- **`.paper-drag-handle`**: Optional visual drag indicators

#### Performance Enhancements
- Hardware acceleration via CSS transforms
- Reduced transition complexity
- Optimized z-index management during drag operations
- Throttled state updates to prevent lag

### 6. HTML Structure Changes

#### CharacterTab.svelte
- Completely restructured layout to move all labels inside torn paper wrappers
- Added drag handles with grip dots icon to each field
- Added `character-paper` class to torn-input-wrapper elements
- Added `data-x="0" data-y="0"` attributes for position tracking
- Changed from grid/card layout to flexible paper container
- Fields now include: Name, Job/Syssla, Face/Ansikte, Body/Kropp, Clothes/Kläder
- Uses shared CSS classes for consistency

#### Skills.svelte
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

## Content-Aware Resizing Feature

### Overview
Implemented dynamic minimum height calculation to prevent content from being clipped when resizing papers.

### How It Works

#### Character Tab Papers
- **Textarea Content Detection**: For papers containing textareas (face, body, clothes), the system calculates the actual text height
- **Dynamic Height Calculation**: Creates a temporary invisible div with the same styling to measure text height
- **Minimum Height Enforcement**: Sets minimum resize height to: header height + content padding + text height + margins
- **Prevents Text Clipping**: Users cannot resize papers smaller than the space needed to display all text content

#### Skills Tab Papers  
- **Control Layout Detection**: Calculates height needed for skill headers and control elements
- **Natural Content Height**: Measures the actual height of skill controls (input fields, buttons)
- **Minimum Content Visibility**: Ensures all skill controls remain visible when resizing

### Implementation Details

#### Content Height Calculation Functions
```javascript
// CharacterTab.svelte - for textarea content
function getMinHeightForContent(element) {
    // Creates temporary div to measure text height
    // Accounts for font, line-height, padding
    // Returns header + content + text height + margins
}

// Skills.svelte - for control elements  
function getMinHeightForContent(element) {
    // Measures header and control heights
    // Returns header + controls + padding + margins
}
```

#### InteractJS Integration
- **Dynamic Modifiers**: Uses InteractJS `restrictSize` modifier with callback function
- **Real-time Calculation**: Minimum height is calculated during resize operation
- **Per-Element Basis**: Each paper can have different minimum heights based on its content

### Benefits
- **Prevents Content Loss**: Text and controls never get clipped or hidden
- **Better UX**: Users get visual feedback when they've reached minimum size
- **Responsive Design**: Minimum size adapts to actual content, not arbitrary fixed values
- **Accessibility**: Ensures all content remains readable and interactive

## Auto-Resize When Typing Feature

### Overview
Added automatic paper expansion when users type in textareas. Papers now grow automatically to accommodate new content, preventing text from being clipped or hidden.

### How It Works

#### Real-time Text Monitoring
- **Input Event Listeners**: Each textarea in character papers has an `oninput` event listener
- **Debounced Processing**: Auto-resize function is debounced (150ms) to avoid excessive calculations during rapid typing
- **Content-Aware Expansion**: Papers only grow when content needs more space, never shrink automatically

#### Implementation Details
```javascript
// Debounced auto-resize function
const debouncedAutoResize = throttle((textarea: HTMLTextAreaElement) => {
    autoResizePaper(textarea);
}, 150); // Wait 150ms after user stops typing

// Applied to each textarea
<textarea 
    oninput={(e) => debouncedAutoResize(e.target as HTMLTextAreaElement)}
    ...
/>
```

#### Character Tab Integration
- **Face Field**: Auto-expands when users add more descriptive text
- **Body Field**: Grows to accommodate longer character descriptions  
- **Clothes Field**: Expands for detailed clothing descriptions
- **Layout Persistence**: Auto-expanded sizes are saved and restored when switching tabs

### Benefits
- **Seamless UX**: Text never gets cut off or hidden when typing
- **Dynamic Layout**: Papers adapt to content length automatically
- **Performance Optimized**: Debounced to prevent lag during typing
- **Non-Destructive**: Manual resizing still works, auto-resize only grows papers
- **Persistent**: Auto-expanded sizes are saved with other layout data

### Technical Implementation
- **Minimum Height Calculation**: Uses existing `getMinHeightForContent()` function
- **Layout Integration**: Auto-resize updates saved paper layouts automatically
- **TypeScript Support**: Proper type safety for textarea elements
- **Event Optimization**: Debounced to balance responsiveness with performance

## Drag Containment Feature

### Overview
Added boundary restrictions to prevent papers from being dragged outside the visible tab area. Papers are now constrained to stay within the `.tab-content` container.

### How It Works

#### InteractJS Restriction Modifiers
- **Containment Boundary**: Papers cannot be dragged outside the `.tab-content` div
- **End-Only Validation**: Restriction is applied when drag ends, allowing smooth movement during drag
- **Universal Application**: Both Character tab and Skills tab papers are contained

#### Implementation Details
```javascript
modifiers: [
    // Restrict dragging to within the tab-content container
    interact.modifiers.restrictRect({
        restriction: '.tab-content',
        endOnly: true
    })
]
```

#### Containment Behavior
- **Visual Feedback**: Papers can be dragged to the edge but snap back if released outside bounds
- **Smooth Dragging**: No jerky movement during drag operations
- **Consistent Boundaries**: Same containment rules apply to all draggable papers
- **Layout Preservation**: Containment works with saved layouts and auto-resize features

### Benefits
- **Prevents Lost Papers**: Users cannot accidentally drag papers outside the visible area
- **Better UX**: Clear boundaries help users understand the draggable area
- **Maintains Layout Integrity**: Papers stay within the designed interface space
- **Mobile Friendly**: Especially helpful on smaller screens where papers could easily go off-screen

### Technical Implementation
- **Character Tab**: All character field papers (Name, Job, Face, Body, Clothes) are contained within `.tab-content`
- **Skills Tab**: All skill papers are contained within `.tab-content`
- **Compatible Features**: Works seamlessly with existing drag/resize, auto-resize, and layout persistence
- **Performance Optimized**: Uses `endOnly: true` to avoid constant boundary checking during movement
