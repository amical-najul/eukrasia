// Metabolic Module - Predefined Lists Configuration

export const PREDEFINED_LISTS = {
    HYDRATION: [
        { name: 'Agua con Vinagre', icon: '💧', description: 'Mezcla 1-2 cucharadas de vinagre de sidra de manzana en un vaso grande de agua. Tómalo antes de las comidas para mejorar la sensibilidad a la insulina.' },
        { name: 'Agua con Sal/Electrolitos', icon: '🧂', description: 'Añade una pizca de sal marina o del Himalaya a tu agua, o usa un sobre de electrolitos sin azúcar. Crucial durante el ayuno para evitar dolores de cabeza.' },
        { name: 'Té Verde/Negro + Jengibre', icon: '🍵', description: 'Infusión caliente o fría. El jengibre ayuda a la digestión y el té aporta antioxidantes. No añadas azúcar ni endulzantes calóricos.' },
        { name: 'Café Negro + Aceite Coco', icon: '☕', description: 'Café solo (sin leche ni azúcar). Opcional: añade 1 cucharadita de aceite de coco o MCT para energía rápida (cetonas).' },
        { name: 'Infusión Orégano/Menta', icon: '🌿', description: 'Hierve agua con orégano o menta. Excelente para la salud intestinal y digestión.' }
    ],
    SUPPLEMENTS: [
        { name: 'Bloque Mañana (B+CoQ10)', icon: '☀️', description: 'Tomar con el desayuno. Complejo B para energía y CoQ10 para salud mitocondrial.' },
        { name: 'Bloque Medio (Omega+Min)', icon: '🌤️', description: 'Tomar con la comida principal. Omega-3 y Minerales esenciales.' },
        { name: 'Bloque Noche (Mg+D3)', icon: '🌙', description: 'Tomar 30-60 min antes de dormir. Magnesio para relajar y Vitamina D3 para regulación hormonal.' }
    ],
    NUTRITION: [
        { name: 'Caldo de Huesos', icon: '🥘', isBreaker: true },
        { name: 'Hígado Encebollado', icon: '🥩', isBreaker: true },
        { name: 'Proteína + Ensalada', icon: '🥗', isBreaker: true },
        { name: 'Huevos Cocidos', icon: '🥚', isBreaker: true },
        { name: 'Fruta (Manzana/Pera)', icon: '🍏', isBreaker: true },
        { name: 'OTRO (Foto Obligatoria)', icon: '📸', isBreaker: true }
    ]
};
