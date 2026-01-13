-- Full i18n Migration Seed
-- Includes: Auth, Admin, Dashboard, Settings, Common

INSERT INTO translations (key, translations, category) VALUES
-- AUTH (Existing + Enhanced)
('auth.welcome', '{"es": "Bienvenido", "en": "Welcome", "pt": "Bem-vindo"}', 'auth'),
('auth.login_subtitle', '{"es": "Inicia sesión para continuar aprendiendo", "en": "Log in to continue learning", "pt": "Faça login para continuar aprendendo"}', 'auth'),
('auth.email', '{"es": "Email", "en": "Email", "pt": "Email"}', 'auth'),
('auth.password', '{"es": "Contraseña", "en": "Password", "pt": "Senha"}', 'auth'),
('auth.login_button', '{"es": "Iniciar Sesión", "en": "Log In", "pt": "Entrar"}', 'auth'),
('auth.forgot_password', '{"es": "¿Olvidaste tu contraseña?", "en": "Forgot your password?", "pt": "Esqueceu sua senha?"}', 'auth'),
('auth.register_link', '{"es": "¿No tienes cuenta? Regístrate", "en": "No account? Sign up", "pt": "Não tem conta? Cadastre-se"}', 'auth'),
('auth.error.invalid_credentials', '{"es": "Credenciales inválidas", "en": "Invalid credentials", "pt": "Credenciais inválidas"}', 'auth'),
('auth.error.verify_email', '{"es": "Debes verificar tu email antes de iniciar sesión", "en": "You must verify your email before logging in", "pt": "Você deve verificar seu e-mail antes de entrar"}', 'auth'),

-- DASHBOARD (New)
('dashboard.welcome_user', '{"es": "¡Hola, {name}!", "en": "Hello, {name}!", "pt": "Olá, {name}!"}', 'dashboard'),
('dashboard.subtitle', '{"es": "Bienvenido a tu panel de usuario. Aquí podrás acceder a tus cursos y progreso próximamente.", "en": "Welcome to your user dashboard. You will be able to access your courses and progress here soon.", "pt": "Bem-vindo ao seu painel de usuário. Você poderá acessar seus cursos e progresso aqui em breve."}', 'dashboard'),
('dashboard.stats.level', '{"es": "Nivel Actual", "en": "Current Level", "pt": "Nível Atual"}', 'dashboard'),
('dashboard.stats.level_value', '{"es": "Principiante", "en": "Beginner", "pt": "Iniciante"}', 'dashboard'),
('dashboard.stats.lessons', '{"es": "Lecciones Completadas", "en": "Lessons Completed", "pt": "Lições Completadas"}', 'dashboard'),
('dashboard.stats.streak', '{"es": "Racha", "en": "Streak", "pt": "Sequência"}', 'dashboard'),
('dashboard.stats.days', '{"es": "Días", "en": "Days", "pt": "Dias"}', 'dashboard'),

-- SETTINGS MODAL (New)
('settings.title', '{"es": "Configuración de Cuenta", "en": "Account Settings", "pt": "Configurações da Conta"}', 'settings'),
('settings.tabs.profile', '{"es": "Perfil", "en": "Profile", "pt": "Perfil"}', 'settings'),
('settings.tabs.security', '{"es": "Seguridad", "en": "Security", "pt": "Segurança"}', 'settings'),
('settings.tabs.preferences', '{"es": "Preferencias", "en": "Preferences", "pt": "Preferências"}', 'settings'),
('settings.tabs.info', '{"es": "Información", "en": "Information", "pt": "Informações"}', 'settings'),

-- SETTINGS PROFILE
('settings.profile.change_photo', '{"es": "Cambiar foto", "en": "Change photo", "pt": "Alterar foto"}', 'settings'),
('settings.profile.delete_photo', '{"es": "Eliminar foto", "en": "Delete photo", "pt": "Excluir foto"}', 'settings'),
('settings.profile.name_label', '{"es": "Nombre Completo", "en": "Full Name", "pt": "Nome Completo"}', 'settings'),
('settings.profile.email_label', '{"es": "Correo Electrónico", "en": "Email Address", "pt": "Endereço de E-mail"}', 'settings'),
('settings.profile.email_hint', '{"es": "Para cambiar tu email, usa la opción específica de seguridad.", "en": "To change your email, use the specific security option.", "pt": "Para alterar seu e-mail, use a opção de segurança específica."}', 'settings'),
('settings.profile.save', '{"es": "Guardar Cambios", "en": "Save Changes", "pt": "Salvar Alterações"}', 'settings'),
('settings.profile.saving', '{"es": "Guardando...", "en": "Saving...", "pt": "Salvando..."}', 'settings'),
('settings.profile.success', '{"es": "Perfil actualizado", "en": "Profile updated", "pt": "Perfil atualizado"}', 'settings'),

-- SETTINGS SECURITY
('settings.security.change_password', '{"es": "Cambiar Contraseña", "en": "Change Password", "pt": "Alterar Senha"}', 'settings'),
('settings.security.current_password', '{"es": "Contraseña Actual", "en": "Current Password", "pt": "Senha Atual"}', 'settings'),
('settings.security.new_password', '{"es": "Nueva Contraseña", "en": "New Password", "pt": "Nova Senha"}', 'settings'),
('settings.security.confirm_password', '{"es": "Confirmar Nueva Contraseña", "en": "Confirm New Password", "pt": "Confirmar Nova Senha"}', 'settings'),
('settings.security.update_btn', '{"es": "Actualizar Contraseña", "en": "Update Password", "pt": "Atualizar Senha"}', 'settings'),
('settings.security.updating', '{"es": "Actualizando...", "en": "Updating...", "pt": "Atualizando..."}', 'settings'),
('settings.security.danger_zone', '{"es": "Zona de Peligro", "en": "Danger Zone", "pt": "Zona de Perigo"}', 'settings'),
('settings.security.delete_account', '{"es": "Eliminar Cuenta", "en": "Delete Account", "pt": "Excluir Conta"}', 'settings'),
('settings.security.delete_warning', '{"es": "Esta acción es permanente y no se puede deshacer.", "en": "This action is permanent and cannot be undone.", "pt": "Esta ação é permanente e não pode ser desfeita."}', 'settings'),
('settings.security.delete_btn', '{"es": "Eliminar mi cuenta", "en": "Delete my account", "pt": "Excluir minha conta"}', 'settings'),
('settings.security.password_mismatch', '{"es": "Las contraseñas no coinciden", "en": "Passwords do not match", "pt": "As senhas não coincidem"}', 'settings'),
('settings.security.success', '{"es": "Contraseña actualizada correctamente", "en": "Password updated successfully", "pt": "Senha atualizada com sucesso"}', 'settings'),

-- SETTINGS PREFERENCES
('settings.darkMode', '{"es": "Dark Mode", "en": "Dark Mode", "pt": "Modo Escuro"}', 'settings'),
('settings.darkMode_desc', '{"es": "Cambiar la apariencia de la aplicación.", "en": "Change application appearance.", "pt": "Mudar a aparência do aplicativo."}', 'settings'),
('settings.language', '{"es": "Language", "en": "Language", "pt": "Idioma"}', 'settings'),
('settings.language_desc', '{"es": "Selecciona el idioma de la interfaz.", "en": "Select interface language.", "pt": "Selecione o idioma da interface."}', 'settings'),

-- SETTINGS INFO
('settings.info.terms', '{"es": "Términos y Condiciones", "en": "Terms & Conditions", "pt": "Termos e Condições"}', 'settings'),
('settings.info.privacy', '{"es": "Política de Privacidad", "en": "Privacy Policy", "pt": "Política de Privacidade"}', 'settings'),
('settings.info.footer', '{"es": "Todos los derechos reservados.", "en": "All rights reserved.", "pt": "Todos os direitos reservados."}', 'settings'),

-- ADMIN (Existing + Enhanced)
('admin.sidebar.system', '{"es": "GESTIÓN DEL SISTEMA", "en": "SYSTEM MANAGEMENT", "pt": "GESTÃO DO SISTEMA"}', 'admin'),
('admin.menu.profile', '{"es": "Mi Perfil", "en": "My Profile", "pt": "Meu Perfil"}', 'admin'),
('admin.menu.users', '{"es": "Gestión de Usuarios", "en": "User Management", "pt": "Gestão de Usuários"}', 'admin'),
('admin.menu.general', '{"es": "Ajustes Generales", "en": "General Settings", "pt": "Configurações Gerais"}', 'admin'),
('admin.menu.google', '{"es": "Autenticación Google", "en": "Google Authentication", "pt": "Autenticação Google"}', 'admin'),
('admin.menu.logout', '{"es": "Cerrar Sesión", "en": "Logout", "pt": "Sair"}', 'admin'),
('admin.profile.view_as_user', '{"es": "Ver como Usuario", "en": "View as User", "pt": "Ver como Usuário"}', 'admin'),
('admin.profile.theme', '{"es": "Tema", "en": "Theme", "pt": "Tema"}', 'admin')

ON CONFLICT (key) DO UPDATE 
SET translations = EXCLUDED.translations, 
    category = EXCLUDED.category;
