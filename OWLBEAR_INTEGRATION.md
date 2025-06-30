# Owlbear Rodeo Integration Guide

This character sheet is designed to work seamlessly with Owlbear Rodeo as a popover extension. Here's how to set it up and use it effectively.

## Features

### 🔧 Dynamic Sizing
- **Responsive Design**: The character sheet adapts to any size from mobile (320px) to desktop (1200px+)
- **Size Controls**: Use the 📏 button to show size controls with preset sizes and manual sliders
- **Owlbear Integration**: When running in Owlbear Rodeo, size changes are automatically communicated to the parent window

### 🦉 Owlbear Rodeo Integration
- **Auto-detection**: Automatically detects when running inside Owlbear Rodeo
- **Character Sync**: Character data is automatically synced with Owlbear Rodeo every minute
- **Status Indicator**: Shows 🦉 when connected to Owlbear Rodeo

### 📱 Responsive Features
- **Mobile-First**: Works great on phones, tablets, and desktops
- **Container Queries**: Uses modern CSS container queries for optimal layout
- **Flexible Grids**: Skill lists and character sections adapt to available space

## Using with Owlbear Rodeo

### Step 1: Deploy the Character Sheet
Deploy this application to a web server (Vercel, Netlify, etc.) or run it locally:

```bash
npm run build
npm run preview
# Or deploy to your preferred hosting service
```

### Step 2: Add as Owlbear Extension
1. In Owlbear Rodeo, go to Extensions
2. Add a new extension with your deployed URL
3. Configure it as a popover extension

### Step 3: Use the Size Controls
- Click the 📏 button to show size controls
- Use preset buttons for common sizes:
  - 📱 Small (400x500) - Good for quick reference
  - 💻 Medium (800x600) - Standard desktop size
  - 🖥️ Large (1200x800) - Full character sheet view
- Use sliders for precise control

## API Reference

### Owlbear Messages

The character sheet communicates with Owlbear Rodeo using these message types:

```typescript
// Resize the popover
{
  type: 'resize',
  data: { width: number, height: number }
}

// Send character data
{
  type: 'character-update',
  data: { /* character sheet state */ }
}

// Request character data
{
  type: 'character-request'
}

// Close the popover
{
  type: 'close'
}
```

### JavaScript Integration

If you're building your own Owlbear extension, you can use the integration utilities:

```typescript
import { owlbearIntegration, useOwlbearResize, useOwlbearSync } from './owlbear-integration';

// Check if running in Owlbear
if (owlbearIntegration.isOwlbearEnvironment) {
  console.log('Running in Owlbear Rodeo!');
}

// Handle resize
const { requestResize } = useOwlbearResize();
requestResize(800, 600);

// Sync character data
const { syncNow, setupAutoSync } = useOwlbearSync(() => characterData);
syncNow(); // Immediate sync
setupAutoSync(30000); // Auto-sync every 30 seconds
```

## Development

### Container Queries Support
The character sheet uses modern CSS container queries for responsive design:

```css
@container (min-width: 500px) {
  .skills-tab {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

### Responsive Breakpoints
- **320px+**: Mobile layout, single column
- **500px+**: Two-column skill grid
- **768px+**: Tablet layout improvements
- **800px+**: Three-column skill grid
- **1024px+**: Full desktop layout

### Testing Responsive Design
1. Use browser dev tools to test different sizes
2. Use the size controls to simulate different popover sizes
3. Test on actual mobile devices

## Best Practices

### For Players
- **Start Small**: Begin with the Small preset and expand as needed
- **Character Overview**: Use Medium size for general gameplay
- **Detailed Editing**: Use Large size when updating character details

### For GMs
- **Quick Reference**: Small size is perfect for NPC sheets
- **Session Prep**: Medium/Large for detailed character review
- **Multi-Character**: Multiple small popovers for managing NPCs

### For Developers
- **Mobile First**: Always design for mobile, then enhance for larger screens
- **Container Queries**: Use container queries instead of viewport media queries
- **Semantic HTML**: Maintain accessibility at all screen sizes

## Troubleshooting

### Size Controls Not Working
- Ensure JavaScript is enabled
- Check browser console for errors
- Verify the extension is properly loaded in Owlbear

### Character Data Not Syncing
- Check the Owlbear connection indicator (🦉)
- Verify the extension has proper permissions
- Check browser console for CORS issues

### Layout Issues at Small Sizes
- Some content may be hidden on very small screens
- Use horizontal scrolling if necessary
- Consider the minimum 320px width requirement

## Customization

You can customize the responsive behavior by modifying:
- `src/app.css` - Global responsive styles
- `src/lib/components/Skills.svelte` - Skill grid responsiveness
- `src/lib/components/SizeControls.svelte` - Size control presets
- `src/lib/owlbear-integration.ts` - Owlbear communication

## Support

For issues with:
- **Character Sheet Functionality**: Check this repository's issues
- **Owlbear Integration**: Refer to Owlbear Rodeo's extension documentation
- **Responsive Design**: Test in multiple browsers and devices
