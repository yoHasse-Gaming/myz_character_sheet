import { BicepsFlexed, Brain, CircleQuestionMark, UsersRound, VenetianMask, type Icon as IconType } from '@lucide/svelte';
import type { AbilityType } from '../types';

export function getIconForAbility(ability: AbilityType): typeof IconType {
    switch (ability) {
        case 'STRENGTH':
            return BicepsFlexed;
        case 'AGILITY':
            return VenetianMask;
        case 'WITS':
            return Brain;
        case 'EMPATHY':
            return UsersRound; 
        default:
            return CircleQuestionMark; // Fallback icon
    }
}

export function getLabelForAbility(ability: AbilityType): string {
    switch (ability) {
        case 'STRENGTH':
            return 'Strength';
        case 'AGILITY':
            return 'Agility';
        case 'WITS':
            return 'Wits';
        case 'EMPATHY':
            return 'Empathy';
        default:
            return 'Unknown Ability'; // Fallback label
    }
}