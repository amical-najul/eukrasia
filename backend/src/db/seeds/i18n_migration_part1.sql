INSERT INTO translations (key, category, translations) VALUES
-- Auth (LoginPage)
('auth.welcome', 'auth', '{"es": "Bienvenido", "pt": "Bem-vindo", "en": "Welcome"}'),
('auth.subtitle_login', 'auth', '{"es": "Inicia sesión para continuar aprendiendo", "pt": "Entre para continuar aprendendo", "en": "Log in to continue learning"}'),
('auth.subtitle_register', 'auth', '{"es": "Crea tu cuenta para comenzar", "pt": "Crie sua conta para começar", "en": "Create your account to start"}'),
('auth.email_label', 'auth', '{"es": "Email", "pt": "E-mail", "en": "Email"}'),
('auth.password_label', 'auth', '{"es": "Contraseña", "pt": "Senha", "en": "Password"}'),
('auth.forgot_password_link', 'auth', '{"es": "¿Olvidaste tu contraseña?", "pt": "Esqueceu sua senha?", "en": "Forgot your password?"}'),
('auth.login_button', 'auth', '{"es": "Iniciar Sesión", "pt": "Entrar", "en": "Login"}'),
('auth.register_button', 'auth', '{"es": "Registrarse", "pt": "Cadastrar-se", "en": "Register"}'),
('auth.or_continue', 'auth', '{"es": "O continúa con", "pt": "Ou continue com", "en": "Or continue with"}'),
('auth.no_account_question', 'auth', '{"es": "¿No tienes cuenta?", "pt": "Não tem conta?", "en": "Don''t have an account?"}'),
('auth.has_account_question', 'auth', '{"es": "¿Ya tienes cuenta?", "pt": "Já tem conta?", "en": "Already have an account?"}'),
('auth.register_action', 'auth', '{"es": "Regístrate", "pt": "Cadastre-se", "en": "Sign up"}'),
('auth.login_action', 'auth', '{"es": "Inicia Sesión", "pt": "Entrar", "en": "Login"}'),
('auth.config_required', 'auth', '{"es": "Configuración Requerida", "pt": "Configuração Necessária", "en": "Configuration Required"}'),
('auth.google_not_configured', 'auth', '{"es": "La autenticación con Google no está configurada.", "pt": "A autenticação do Google não está configurada.", "en": "Google authentication is not configured."}'),

-- Admin Layout
('admin.system_management', 'admin', '{"es": "Gestión del Sistema", "pt": "Gestão do Sistema", "en": "System Management"}'),
('admin.menu.profile', 'admin', '{"es": "Mi Perfil", "pt": "Meu Perfil", "en": "My Profile"}'),
('admin.menu.users', 'admin', '{"es": "Gestión de Usuarios", "pt": "Gestão de Usuários", "en": "User Management"}'),
('admin.menu.general', 'admin', '{"es": "Ajustes Generales", "pt": "Configurações Gerais", "en": "General Settings"}'),
('admin.menu.google', 'admin', '{"es": "Autenticación Google", "pt": "Autenticação Google", "en": "Google Authentication"}'),
('admin.theme', 'admin', '{"es": "Tema", "pt": "Tema", "en": "Theme"}'),
('admin.view_as_user', 'admin', '{"es": "Ver como Usuario", "pt": "Ver como Usuário", "en": "View as User"}'),
('admin.logout', 'admin', '{"es": "Cerrar Sesión", "pt": "Sair", "en": "Logout"}')

ON CONFLICT (key) DO UPDATE SET translations = EXCLUDED.translations;
