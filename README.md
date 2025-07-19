# MYZ Character Sheet

## High Priority Fixes
* [ ] Fix paper card positioning - prevent spread across entire screen
* [x] Move add item button to always be sticky on the right side of screen
* [ ] Fix drop zone positioning and calculation for new items
* [ ] Update card default/starting positions to look good
* [ ] Add layout lock mechanism to prevent accidental card movement

## UI/UX Improvements
* [ ] Standardize control buttons (pan/zoom, reset, size, light/dark) - same location and style
* [ ] Update relation cards to be wider and more readable
* [ ] Verify modal styling consistency across all modals
* [ ] Add atmospheric glow effect for flashlight drop zones

## Relations System
* [ ] Add default relations:
  * [ ] RP 1 
  * [ ] RP 2
  * [ ] I hate
  * [ ] I want to protect
* [ ] Add ability to edit relations directly on cards (like name, body, face fields)

## Data Persistence
* [ ] Fix saving card positions to browser local storage
* [ ] Fix saving to Owlbear integration
  * [ ] Make it so only DM/GM can view all other characters

## Design Consistency
* [ ] Apply paper-style to all sections
* [ ] Make mutations draggable like skills
* [ ] Make base abilities draggable like skills  
* [ ] Add paper-background style to conditions and make them draggable
* [ ] Add paper-background style to severe conditions and make them draggable

## Features
* [ ] Add dice roll result callback for toast notifications
* [ ] Add equipment selection dropdown for dice rolls (equipment with bonuses/weapons for skills)
* [ ] Add grouping system for paper items to move together
* [ ] Ensure character data saving/loading works correctly

## Completed Features ✅
* [✅] Common drag and drop system for all tabs
* [✅] Flashlight drop zone overlay system with highlighting
* [✅] Add weapons from weapons.json with custom weapon option
* [✅] Updated modals to match card-grid selection style
* [✅] Direct card editing instead of modal-based editing
* [✅] Custom item creation (weapons, equipment, armor)

## Known Bugs
* [ ] Drop zones are as wide as container - should have max-width equal to height
* [ ] Modal backdrops positioning issues
