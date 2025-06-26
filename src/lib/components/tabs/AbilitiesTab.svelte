<script lang="ts">
    import FormSection from '$lib/components/FormSection.svelte';
    import GroundAbility from '$lib/components/GroundAbility.svelte';
    import { onMount } from 'svelte';
    import Skills from '../Skills.svelte';

    type GroundAbilityType = {
        label: string;
        damageLabel: string;
        value: number;
        damage: number;
    };

    export let groundAbilities: GroundAbilityType[] = [
        { label: 'Styrka', damageLabel: 'Skada', value: 1, damage: 0 },
        { label: 'Kyla', damageLabel: 'Stress', value: 1, damage: 0 },
        { label: 'Skärpa', damageLabel: 'Förvirring', value: 1, damage: 0 },
        { label: 'Känsla', damageLabel: 'Tvivel', value: 1, damage: 0 }
    ];

    let formData = {
        condition: {
            isStarving: false,
            isSleepDeprived: false,
            isDehydrated: false,
            isFreezing: false
        }
    };
</script> 

        <div class="properties-tab">
            <div class="grid" style="grid-template-columns: 25rem auto;">
                <div>
                    <FormSection header="GRUNDEGENSKAPER">
                        {#each groundAbilities as ability}
                            <GroundAbility
                                groundAbilityLabel={ability.label}
                                groundAbilityDmgLabel={ability.damageLabel}
                                bind:groundAbilityValue={ability.value}
                                bind:groundAbilityDmg={ability.damage}
                            />
                        {/each}
                    </FormSection>
                    
                    <FormSection header="TILLSTÅND">
                        <table>
                            <tbody>
                                <tr>
                                    <td>Utsvulten</td>
                                    <td><input type="checkbox" bind:checked={formData.condition.isStarving} /></td>
                                    <td>Sömnlös</td>
                                    <td><input type="checkbox" bind:checked={formData.condition.isSleepDeprived} /></td>
                                </tr>
                                <tr>
                                    <td>Uttorkad</td>
                                    <td><input type="checkbox" bind:checked={formData.condition.isDehydrated} /></td>
                                    <td>Nedkyld</td>
                                    <td><input type="checkbox" bind:checked={formData.condition.isFreezing} /></td>
                                </tr>
                                <tr>
                                    <td>Kritiska skador:</td>
                                    <td colspan="3">
                                        <input type="text" />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </FormSection>
                </div>
                <div>
                    <FormSection header="FÄRDIGHETER">
                        <Skills />
                    </FormSection>
                </div>
            </div>
        </div>