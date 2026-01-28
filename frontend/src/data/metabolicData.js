export const PREDEFINED_LISTS = {
    HYDRATION: [
        { name: 'Agua con Vinagre', icon: '💧', description: 'Mezcla 1-2 cucharadas de vinagre de sidra de manzana en un vaso grande de agua. Tómalo antes de las comidas para mejorar la sensibilidad a la insulina.' },
        { name: 'Agua con Sal/Electrolitos', icon: '🧂', description: 'Añade una pizca de sal marina o del Himalaya a tu agua, o usa un sobre de electrolitos sin azúcar. Crucial durante el ayuno para evitar dolores de cabeza.' },
        { name: 'Té Verde/Negro + Jengibre', icon: '🍵', description: 'Infusión caliente o fría. El jengibre ayuda a la digestión y el té aporta antioxidantes. No añadas azúcar ni endulzantes calóricos.' },
        { name: 'Café Negro + Aceite Coco', icon: '☕', description: 'Café solo (sin leche ni azúcar). Opcional: añade 1 cucharadita de aceite de coco o MCT para energía rápida (cetonas).' },
        { name: 'Infusión Orégano/Menta', icon: '🌿', description: 'Hierve agua con orégano o menta. Excelente para la salud intestinal y digestión.' }
    ],
    NUTRITION: [
        { name: 'Caldo de Huesos', icon: '🥘', isBreaker: true },
        { name: 'Hígado Encebollado', icon: '🥩', isBreaker: true },
        { name: 'Proteína + Ensalada', icon: '🥗', isBreaker: true },
        { name: 'Huevos Cocidos', icon: '🥚', isBreaker: true },
        { name: 'Fruta (Manzana/Pera)', icon: '🍏', isBreaker: true },
        { name: 'OTRO (Crear Plato)', icon: '📸', isBreaker: true }
    ]
    // Note: Nutrition items are always breakers and use Camera, so description is less critical for "consumption" but good for consistency.
};
