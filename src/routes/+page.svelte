<script lang="ts">
    import GroundAbility from '$lib/components/GroundAbility.svelte';
    import { onMount } from 'svelte';

    type Talent = {
        name: string;
        description: string;
    }

    type Mutation = {
        name: string;
        description: string;
    }

    type Skill = {
        name: string;
        description: string;
        value: number;
        groundAbility: string;
    }

    type Equipment = {
        name: string;
        description: string;
        total: number;
        weight: number;
    }

    type Armor = {
        name: string;
        description: string;
        protection: number;
        weight: number;
    }

    type Weapon = {
        name: string;
        description: string;
        bonus: number;
        damage: number;
        range: number;
        weight: number;
    }

    type RPRelation = {
        name: string;
        description: string;
        isClose: boolean;
    }

    type KeyValuePair = {
        key: string;
        value: string;
    }

    type MyCharSheet = {
        name: string;
        job: string;
        appearance: {
            face: string;
            body: string;
            clothes: string;
        };
        groundAbilities: {
            strength: {
                value: number;
                damage: number;
            };
            coolness: {
                value: number;
                damage: number;
            };
            sharpness: {
                value: number;
                damage: number;
            };
            feeling: {
                value: number;
                damage: number;
            }
        };
        condition: {
            isStarving: boolean;
            isSleepDeprived: boolean;
            isDehydrated: boolean;
            isFreezing: boolean;
        };
        acuteWounds: string[];

        talents: Talent[];
        mutations: Mutation[];
        skills: Skill[];
        talentPoints: number;
        mutationPoints: number;
        equipment: Equipment[];
        zoneRot: number;
        shells: number;
        armor: Armor[];
        weapons: Weapon[];
        rPRelations: RPRelation[];
        hates: KeyValuePair,
        loves: KeyValuePair,
        myBiggestDream: KeyValuePair,

        notes: string[];
    }

    const formData: MyCharSheet = {
        name: '',
        job: '',
        appearance: {
            face: '',
            body: '',
            clothes: ''
        },
        groundAbilities: {
            strength: { value: 0, damage: 0 },
            coolness: { value: 0, damage: 0 },
            sharpness: { value: 0, damage: 0 },
            feeling: { value: 0, damage: 0 }
        },
        condition: {
            isStarving: false,
            isSleepDeprived: false,
            isDehydrated: false,
            isFreezing: false
        },
        acuteWounds: [],
        talents: [],
        mutations: [],
        skills: [],
        talentPoints: 0,
        mutationPoints: 0,
        equipment: [],
        zoneRot: 0,
        shells: 0,
        armor: [],
        weapons: [],
        rPRelations: [],
        hates: { key:'', value:''},
        loves:{ key:'', value:''},
        myBiggestDream:{ key:'', value:''},
        notes:[]
    };


</script>

<main class="container">
  <h2>Rollformulär Mutant År: Noll</h2>

  <div class="grid">

    <article>
      <header>
        <h2>Grundeegenskaper</h2>
      </header>

      <GroundAbility
        groundAbilityLabel="Styrka"
        groundAbilityDmgLabel="Skada"
        bind:groundAbilityValue={formData.groundAbilities.strength.value}
        bind:groundAbilityDmg={formData.groundAbilities.strength.damage}
      />

      <GroundAbility
        groundAbilityLabel="Kyla"
        groundAbilityDmgLabel="Stress"
        bind:groundAbilityValue={formData.groundAbilities.coolness.value}
        bind:groundAbilityDmg={formData.groundAbilities.coolness.damage}
      />

      <GroundAbility
        groundAbilityLabel="Skärpa"
        groundAbilityDmgLabel="Förvirring"
        bind:groundAbilityValue={formData.groundAbilities.sharpness.value}
        bind:groundAbilityDmg={formData.groundAbilities.sharpness.damage}
      />
      <GroundAbility
        groundAbilityLabel="Känsla"
        groundAbilityDmgLabel="Tvivel"
        bind:groundAbilityValue={formData.groundAbilities.feeling.value}
        bind:groundAbilityDmg={formData.groundAbilities.feeling.damage}
      />


    </article>

    <article>
      <header>
        <h2>Utseende</h2>
      </header>
    </article>




  </div>

</main>
