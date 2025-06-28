<script lang="ts">
    import FormSection from '$lib/components/FormSection.svelte';
    import BaseAbility from '$lib/components/BaseAbility.svelte';
    import { onMount } from 'svelte';
    import Skills from '../Skills.svelte';
    import { sheetState, characterActions } from '$lib/character_sheet.svelte';
</script> 

        <div class="properties-tab">
            <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div class="space-y-6">
                    <FormSection header="⚠️ GRUNDEGENSKAPER">
                        <div class="space-y-4">
                            {#each sheetState.baseAbilities as ability, index}
                                <BaseAbility
                                    baseAbilityLabel={ability.label}
                                    baseAbilityDmgLabel={ability.damageLabel}
                                    abilityIndex={index}
                                />
                            {/each}
                        </div>
                    </FormSection>
                    
                    <FormSection header="🩸 TILLSTÅND">
                        <div class="overflow-x-auto">
                            <table class="table table-hover w-full">
                                <tbody>
                                    <tr class="hover:bg-warning-500/10">
                                        <td class="font-medium">🍖 Utsvulten</td>
                                        <td><input type="checkbox" class="checkbox" bind:checked={sheetState.conditions.isStarving} /></td>
                                        <td class="font-medium">😴 Sömnlös</td>
                                        <td><input type="checkbox" class="checkbox" bind:checked={sheetState.conditions.isSleepDeprived} /></td>
                                    </tr>
                                    <tr class="hover:bg-warning-500/10">
                                        <td class="font-medium">💧 Uttorkad</td>
                                        <td><input type="checkbox" class="checkbox" bind:checked={sheetState.conditions.isDehydrated} /></td>
                                        <td class="font-medium">🧊 Nedkyld</td>
                                        <td><input type="checkbox" class="checkbox" bind:checked={sheetState.conditions.isFreezing} /></td>
                                    </tr>
                                    <tr class="hover:bg-warning-500/10">
                                        <td class="font-medium text-warning-400">💀 Kritiska skador:</td>
                                        <td colspan="3">
                                            <input type="text" class="input input-sm w-full font-user" placeholder="Beskrivning av allvarliga skador..." bind:value={sheetState.criticalInjuries} />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </FormSection>
                </div>
                <div class="xl:col-span-2">
                    <FormSection header="🎯 FÄRDIGHETER">
                        <Skills />
                    </FormSection>
                </div>
            </div>
        </div>