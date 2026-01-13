-- Seed de traducciones base para ES/PT/EN
-- Ejecutar después de crear la tabla translations

-- =====================
-- CATEGORÍA: auth
-- =====================
INSERT INTO translations (key, category, translations) VALUES
('auth.login', 'auth', '{"es": "Iniciar Sesión", "pt": "Entrar", "en": "Login"}'),
('auth.register', 'auth', '{"es": "Registrarse", "pt": "Cadastrar-se", "en": "Register"}'),
('auth.logout', 'auth', '{"es": "Cerrar Sesión", "pt": "Sair", "en": "Logout"}'),
('auth.email', 'auth', '{"es": "Correo electrónico", "pt": "E-mail", "en": "Email"}'),
('auth.password', 'auth', '{"es": "Contraseña", "pt": "Senha", "en": "Password"}'),
('auth.confirm_password', 'auth', '{"es": "Confirmar contraseña", "pt": "Confirmar senha", "en": "Confirm password"}'),
('auth.forgot_password', 'auth', '{"es": "¿Olvidaste tu contraseña?", "pt": "Esqueceu sua senha?", "en": "Forgot your password?"}'),
('auth.reset_password', 'auth', '{"es": "Restablecer contraseña", "pt": "Redefinir senha", "en": "Reset password"}'),
('auth.no_account', 'auth', '{"es": "¿No tienes cuenta?", "pt": "Não tem conta?", "en": "Don''t have an account?"}'),
('auth.have_account', 'auth', '{"es": "¿Ya tienes cuenta?", "pt": "Já tem conta?", "en": "Already have an account?"}'),
('auth.login_with_google', 'auth', '{"es": "Iniciar sesión con Google", "pt": "Entrar com Google", "en": "Login with Google"}'),
('auth.or', 'auth', '{"es": "o", "pt": "ou", "en": "or"}'),
('auth.verify_email', 'auth', '{"es": "Verificar correo electrónico", "pt": "Verificar e-mail", "en": "Verify email"}'),
('auth.email_verified', 'auth', '{"es": "Correo verificado exitosamente", "pt": "E-mail verificado com sucesso", "en": "Email verified successfully"}'),
('auth.email_not_verified', 'auth', '{"es": "Por favor verifica tu correo electrónico", "pt": "Por favor verifique seu e-mail", "en": "Please verify your email"}')
ON CONFLICT (key) DO UPDATE SET translations = EXCLUDED.translations, updated_at = CURRENT_TIMESTAMP;

-- =====================
-- CATEGORÍA: common
-- =====================
INSERT INTO translations (key, category, translations) VALUES
('common.save', 'common', '{"es": "Guardar", "pt": "Salvar", "en": "Save"}'),
('common.cancel', 'common', '{"es": "Cancelar", "pt": "Cancelar", "en": "Cancel"}'),
('common.delete', 'common', '{"es": "Eliminar", "pt": "Excluir", "en": "Delete"}'),
('common.edit', 'common', '{"es": "Editar", "pt": "Editar", "en": "Edit"}'),
('common.create', 'common', '{"es": "Crear", "pt": "Criar", "en": "Create"}'),
('common.update', 'common', '{"es": "Actualizar", "pt": "Atualizar", "en": "Update"}'),
('common.loading', 'common', '{"es": "Cargando...", "pt": "Carregando...", "en": "Loading..."}'),
('common.error', 'common', '{"es": "Error", "pt": "Erro", "en": "Error"}'),
('common.success', 'common', '{"es": "Éxito", "pt": "Sucesso", "en": "Success"}'),
('common.confirm', 'common', '{"es": "Confirmar", "pt": "Confirmar", "en": "Confirm"}'),
('common.close', 'common', '{"es": "Cerrar", "pt": "Fechar", "en": "Close"}'),
('common.back', 'common', '{"es": "Volver", "pt": "Voltar", "en": "Back"}'),
('common.next', 'common', '{"es": "Siguiente", "pt": "Próximo", "en": "Next"}'),
('common.previous', 'common', '{"es": "Anterior", "pt": "Anterior", "en": "Previous"}'),
('common.search', 'common', '{"es": "Buscar", "pt": "Pesquisar", "en": "Search"}'),
('common.actions', 'common', '{"es": "Acciones", "pt": "Ações", "en": "Actions"}')
ON CONFLICT (key) DO UPDATE SET translations = EXCLUDED.translations, updated_at = CURRENT_TIMESTAMP;

-- =====================
-- CATEGORÍA: settings
-- =====================
INSERT INTO translations (key, category, translations) VALUES
('settings.title', 'settings', '{"es": "Configuración de Cuenta", "pt": "Configurações da Conta", "en": "Account Settings"}'),
('settings.profile', 'settings', '{"es": "Perfil", "pt": "Perfil", "en": "Profile"}'),
('settings.security', 'settings', '{"es": "Seguridad", "pt": "Segurança", "en": "Security"}'),
('settings.preferences', 'settings', '{"es": "Preferencias", "pt": "Preferências", "en": "Preferences"}'),
('settings.info', 'settings', '{"es": "Información", "pt": "Informação", "en": "Information"}'),
('settings.full_name', 'settings', '{"es": "Nombre Completo", "pt": "Nome Completo", "en": "Full Name"}'),
('settings.change_photo', 'settings', '{"es": "Cambiar foto", "pt": "Alterar foto", "en": "Change photo"}'),
('settings.current_password', 'settings', '{"es": "Contraseña actual", "pt": "Senha atual", "en": "Current password"}'),
('settings.new_password', 'settings', '{"es": "Nueva contraseña", "pt": "Nova senha", "en": "New password"}'),
('settings.change_password', 'settings', '{"es": "Cambiar contraseña", "pt": "Alterar senha", "en": "Change password"}'),
('settings.delete_account', 'settings', '{"es": "Eliminar cuenta", "pt": "Excluir conta", "en": "Delete account"}'),
('settings.dark_theme', 'settings', '{"es": "Tema Oscuro", "pt": "Tema Escuro", "en": "Dark Theme"}'),
('settings.dark_theme_desc', 'settings', '{"es": "Cambiar la apariencia de la aplicación.", "pt": "Alterar a aparência do aplicativo.", "en": "Change the appearance of the application."}'),
('settings.language', 'settings', '{"es": "Idioma", "pt": "Idioma", "en": "Language"}'),
('settings.language_desc', 'settings', '{"es": "Selecciona tu idioma preferido", "pt": "Selecione seu idioma preferido", "en": "Select your preferred language"}'),
('settings.save_changes', 'settings', '{"es": "Guardar Cambios", "pt": "Salvar Alterações", "en": "Save Changes"}')
ON CONFLICT (key) DO UPDATE SET translations = EXCLUDED.translations, updated_at = CURRENT_TIMESTAMP;

-- =====================
-- CATEGORÍA: admin
-- =====================
INSERT INTO translations (key, category, translations) VALUES
('admin.title', 'admin', '{"es": "AdminPanel", "pt": "AdminPanel", "en": "AdminPanel"}'),
('admin.subtitle', 'admin', '{"es": "Gestión del Sistema", "pt": "Gestão do Sistema", "en": "System Management"}'),
('admin.my_profile', 'admin', '{"es": "Mi Perfil", "pt": "Meu Perfil", "en": "My Profile"}'),
('admin.user_management', 'admin', '{"es": "Gestión de Usuarios", "pt": "Gestão de Usuários", "en": "User Management"}'),
('admin.general_settings', 'admin', '{"es": "Ajustes Generales", "pt": "Configurações Gerais", "en": "General Settings"}'),
('admin.google_auth', 'admin', '{"es": "Autenticación Google", "pt": "Autenticação Google", "en": "Google Authentication"}'),
('admin.view_as_user', 'admin', '{"es": "Ver como Usuario", "pt": "Ver como Usuário", "en": "View as User"}'),
('admin.back_to_admin', 'admin', '{"es": "Volver al AdminPanel", "pt": "Voltar ao AdminPanel", "en": "Back to AdminPanel"}')
ON CONFLICT (key) DO UPDATE SET translations = EXCLUDED.translations, updated_at = CURRENT_TIMESTAMP;

-- =====================
-- CATEGORÍA: dashboard
-- =====================
INSERT INTO translations (key, category, translations) VALUES
('dashboard.welcome', 'dashboard', '{"es": "¡Hola, %NAME%!", "pt": "Olá, %NAME%!", "en": "Hello, %NAME%!"}'),
('dashboard.welcome_subtitle', 'dashboard', '{"es": "Bienvenido a tu panel de control personalizado", "pt": "Bem-vindo ao seu painel de controle personalizado", "en": "Welcome to your personalized dashboard"}'),
('dashboard.level', 'dashboard', '{"es": "Nivel Actual", "pt": "Nível Atual", "en": "Current Level"}'),
('dashboard.lessons', 'dashboard', '{"es": "Lecciones Completadas", "pt": "Lições Concluídas", "en": "Completed Lessons"}'),
('dashboard.streak', 'dashboard', '{"es": "Racha Actual", "pt": "Sequência Atual", "en": "Current Streak"}'),
('dashboard.days', 'dashboard', '{"es": "días", "pt": "dias", "en": "days"}')
ON CONFLICT (key) DO UPDATE SET translations = EXCLUDED.translations, updated_at = CURRENT_TIMESTAMP;

-- =====================
-- CATEGORÍA: errors
-- =====================
INSERT INTO translations (key, category, translations) VALUES
('errors.generic', 'errors', '{"es": "Ha ocurrido un error", "pt": "Ocorreu um erro", "en": "An error occurred"}'),
('errors.network', 'errors', '{"es": "Error de conexión", "pt": "Erro de conexão", "en": "Connection error"}'),
('errors.invalid_credentials', 'errors', '{"es": "Credenciales inválidas", "pt": "Credenciais inválidas", "en": "Invalid credentials"}'),
('errors.required_field', 'errors', '{"es": "Este campo es requerido", "pt": "Este campo é obrigatório", "en": "This field is required"}'),
('errors.invalid_email', 'errors', '{"es": "Correo electrónico inválido", "pt": "E-mail inválido", "en": "Invalid email"}'),
('errors.password_mismatch', 'errors', '{"es": "Las contraseñas no coinciden", "pt": "As senhas não coincidem", "en": "Passwords do not match"}'),
('errors.image_too_large', 'errors', '{"es": "La imagen no debe superar los 12MB", "pt": "A imagem não deve exceder 12MB", "en": "Image must not exceed 12MB"}')
ON CONFLICT (key) DO UPDATE SET translations = EXCLUDED.translations, updated_at = CURRENT_TIMESTAMP;
