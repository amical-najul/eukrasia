export const TEMPLATES_CONFIG = [
    {
        key: 'email_verification',
        name: 'Verificación de Email',
        description: 'Enviado cuando un usuario se registra para verificar su dirección de correo.',
        icon: '✉️'
    },
    {
        key: 'password_reset',
        name: 'Restablecer Contraseña',
        description: 'Enviado cuando un usuario solicita restablecer su contraseña.',
        icon: '🔑'
    },
    {
        key: 'email_change',
        name: 'Cambio de Email',
        description: 'Enviado cuando un usuario solicita cambiar su dirección de correo.',
        icon: '📧'
    }
];

export const PLACEHOLDERS = [
    { var: '%DISPLAY_NAME%', desc: 'Nombre del usuario' },
    { var: '%APP_NAME%', desc: 'Nombre de la aplicación' },
    { var: '%EMPRESA_NAME%', desc: 'Nombre de la empresa' },
    { var: '%SUPPORT_EMAIL%', desc: 'Email de soporte' },
    { var: '%LINK%', desc: 'URL de acción (verificar/reset)' },
    { var: '%EMAIL%', desc: 'Correo electrónico del usuario' },
    { var: '%NEW_EMAIL%', desc: 'Nuevo correo (solo cambio de email)' },
];
