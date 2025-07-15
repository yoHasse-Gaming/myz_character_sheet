# TODO:
* [x] - Fix so it's a common function for all tabs. Like, use the same logic for all tabs.
    * [x] Drag and drop for papers, like dragging a paper to a title to "add" new content.
    * [x] Drop should have a "drop zone" which is like a red-flashlight where the item can be dropped. and become yellow when it's inside of bounds for dropping.
    * [x] Full overlay system with flashlight circles highlighting all drop zones simultaneously.
    * [ ] - Add atmospheric glow for flashlight effect
* [ ] - Fix so the design or style is the same for all tabs.
    * Paper-style for every section.
    * [ ] - Mutations should be like skills with dragable mutations.
    * [ ] - Base-skills should be like skills with dragable base-skills.
    * [ ] - Conditions should have paper-background style and be draggable.
    * [ ] - Severe conditions should have paper-background style and be draggable.
* [ ] - When rolling dice, have a result callback so a toast icon can be shown with the result.


* [ ] - Finish all tabs so they are usable.
* [ ] - Make sure character data is saved and loaded correctly.
* [ ] - Add grouping for all paper-items. Like beeing able to group papers together and have them move together.

# TODO next:
* [x] Add weapon from weapon.json
    * [x] Allow user to either add a predefined weapon or create a custom one.
* [x] Update WeaponModal and EquipmentModal to match MutationsModal/TalentsModal style with card-grid selection and "Custom" option.
* [x] Update each equiptment, weapon and armor cards to be editable directly instead of using a modal. 
* [x] Update "Anpassad" to just add an empty card to edit.
* Allow for modification of existing weapons and equipment and armor.
* Add selection for dice roll for skills I want the equipment dice to be a dropdown to select equipment with a bonus or a weapon that is connected to that skill.

For example.
Weapons.json contains 


## Bugs:
* [ ] - Drop zones are as wide as the container, should have a max-width which is the same as the height.
