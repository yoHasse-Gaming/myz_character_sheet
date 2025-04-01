
export type BooleanGroupOfFive = {
    1: boolean;
    2: boolean;
    3: boolean;
    4: boolean;
    5: boolean;
}

export type BooleanGroupOfTen = {
    1: boolean;
    2: boolean;
    3: boolean;
    4: boolean;
    5: boolean;
    6: boolean;
    7: boolean;
    8: boolean;
    9: boolean;
    10: boolean;
}

export type BooleanGroupOfThree = {
    1: boolean;
    2: boolean;
    3: boolean;
}


// 3st erfarenhetspoäng

export type Fardighet = {
    name: string;
    value: number;
}

export type vapen = {
    namn: string;
    bonus: string;
    skada: string;
    rackvidd: string;
}


export type CharacterSheet = {
    styrka: {
        value: number;
        radiogrupp: BooleanGroupOfFive;
    };
    kyla: {
        value: number;
        radiogrupp: BooleanGroupOfFive;
    };

    skarpa: {
        value: number;
        radiogrupp: BooleanGroupOfFive;
    };

    kansla: {
        value: number;
        radiogrupp: BooleanGroupOfFive;
    };

    utsvulten: boolean;
    somnlos: boolean;
    uttorkad: boolean;
    nedkyld: boolean;

    kritiskaskador: BooleanGroupOfThree;
    kampa_pa: number;
    ta_krafttag: number;
    slass: number;
    smyga: number;
    fly: number;
    skjuta: number;
    speja: number;
    forsta_sig_pa: number;
    kanna_zonen: number;
    genomskada: number;
    manipulera: number;
    varda: number;
    fardighet1: Fardighet;
    fardighet2: Fardighet;

    erfarenhetspoang: BooleanGroupOfTen;

    namn: string;
    syssla: string;
    utseende_ansikte: string;
    utseende_kropp: string;
    utseende_klader: string;
    mutation1: string;
    mutation2: string;
    mutation3: string;
    mutation4: string;
    mutation5: string;
    mutationspoang: BooleanGroupOfTen;
    zonrota: BooleanGroupOfTen;
    rustning_txt: string;
    rustning_skyddsvarde: string;
    talanger: string[];
    utrustning: string[];
    
    vapen: vapen[];

    relation_relation1: string;
    rp1_close: boolean;
    relation_relation2: string;
    rp2_close: boolean;
    relation_relation3: string;
    rp3_close: boolean;
    relation_relation4: string;
    rp4_close: boolean;
    hate_relation: string;
    love_relation: string;
    my_dream: string;
};