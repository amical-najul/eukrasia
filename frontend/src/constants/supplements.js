export const SUPPLEMENTS = [
    {
        id: 'vit_d_k_mg',
        name: 'Vitamina D + K + Magnesio',
        details: 'Vitamina D (50 mcg), Vitamina K (120 mcg), Magnesio (350 mg).',
        block: 'night',
        icons: ['moon'],
        warning: null
    },
    {
        id: 'omega_3',
        name: 'Omega 3',
        details: '1.236 mg de Omega 3 (EPA 540 mg / DHA 360 mg) por 3 cápsulas. Alta concentración.',
        block: 'mid',
        icons: ['sun_cloud'],
        warning: 'requires_fat' // 🥑
    },
    {
        id: 'minerales_mix',
        name: 'Minerales (Mix)',
        details: 'Selenio (200 mcg), Zinco (29,59 mg), Cobre (2000 mcg). Bisglicinatos.',
        block: 'mid',
        icons: ['sun_cloud'],
        warning: null
    },
    {
        id: 'triple_magnesium',
        name: 'Triple Magnesium',
        details: 'Mezcla de Malato, Taurato y Bisglicinato. 250 mg total cada 2 cápsulas.',
        block: 'night',
        icons: ['moon'],
        warning: 'dose_2_caps'
    },
    {
        id: 'coq10',
        name: 'Coenzima Q10',
        details: '200 mg + Vitamina E (20 mg).',
        block: 'morning',
        icons: ['sun'],
        warning: 'requires_fat'
    },
    {
        id: 'vit_b12',
        name: 'Vitamina B12',
        details: 'Metilcobalamina (9,94 mcg). Marca Nutrify.',
        block: 'morning',
        icons: ['sun'],
        warning: null
    },
    {
        id: 'enzimas_digestivas',
        name: 'Enzimas Digestivas',
        details: 'Mezcla de Proteasa, Bromelina, Lactasa, Lipasa, etc. (1000 mg por dosis).',
        block: 'any',
        icons: ['meal'],
        warning: 'with_meal'
    },
    {
        id: 'picolinato_cromo',
        name: 'Picolinato de Cromo',
        details: 'Cromo (35 mcg). Laboratorio Profit.',
        block: 'any',
        icons: [],
        warning: null
    },
    {
        id: 'creatina',
        name: 'Creatina',
        details: '3.000 mg (3 g) por dosis. Monohidrato.',
        block: 'any',
        icons: [],
        warning: null
    },
    {
        id: 'complejo_b',
        name: 'Complejo B',
        details: 'B1, B2, B3, B5, B6, B7, B9, B12 + Inositol + Colina. Espectro completo.',
        block: 'morning',
        icons: ['sun'],
        warning: null
    }
];

export const BLOCKS = {
    morning: { label: 'Bloque Mañana', icon: '☀️' },
    mid: { label: 'Bloque Medio', icon: '🌤️' },
    night: { label: 'Bloque Noche', icon: '🌙' },
    any: { label: 'Cualquier Momento / Con Comidas', icon: '🍽️' }
};
