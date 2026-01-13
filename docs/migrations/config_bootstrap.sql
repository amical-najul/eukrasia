--
-- PostgreSQL database dump
--

\restrict rPVaaOmpGgr1GOD4IE3zAfiIx6YBz5MSDuAbWr05pqvm9y8hFd82mc3yAnZ5O2r

-- Dumped from database version 15.15 (Debian 15.15-1.pgdg13+1)
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: advanced_settings; Type: TABLE DATA; Schema: public; Owner: amilcar_Usuario
--

-- LLM API keys removed for security

INSERT INTO public.advanced_settings (id, setting_key, setting_value, is_encrypted, updated_at) VALUES (1, 'ai_global_enabled', 'false', false, '2026-01-11 22:02:01.964659');
INSERT INTO public.advanced_settings (id, setting_key, setting_value, is_encrypted, updated_at) VALUES (43, 'llm_provider', 'google', false, '2026-01-11 22:02:01.964659');
INSERT INTO public.advanced_settings (id, setting_key, setting_value, is_encrypted, updated_at) VALUES (44, 'llm_model', 'gemini-2.5-pro', false, '2026-01-11 22:02:01.964659');
INSERT INTO public.advanced_settings (id, setting_key, setting_value, is_encrypted, updated_at) VALUES (46, 'llm_provider_secondary', 'google', false, '2026-01-11 22:02:01.964659');
-- JWT Secret reset for security. Change immediately in Admin Panel.
INSERT INTO public.advanced_settings (id, setting_key, setting_value, is_encrypted, updated_at) VALUES (51, 'jwt_secret', 'TEMPORAL_JWT_SECRET_CHANGE_ME', false, '2026-01-12 03:30:26.705354');


--
-- Data for Name: ai_limits; Type: TABLE DATA; Schema: public; Owner: amilcar_Usuario
--

INSERT INTO public.ai_limits (role, daily_token_limit, daily_request_limit, enabled, updated_at) VALUES ('admin', 100000, 1000, true, '2026-01-11 22:02:01.964659');
INSERT INTO public.ai_limits (role, daily_token_limit, daily_request_limit, enabled, updated_at) VALUES ('user', 10000, 50, true, '2026-01-11 22:02:01.964659');
INSERT INTO public.ai_limits (role, daily_token_limit, daily_request_limit, enabled, updated_at) VALUES ('guest', 1000, 10, true, '2026-01-11 22:02:01.964659');


--
-- Data for Name: app_settings; Type: TABLE DATA; Schema: public; Owner: amilcar_Usuario
--

INSERT INTO public.app_settings (id, setting_key, setting_value, created_at, updated_at) VALUES (141, 'smtp_pass', '', '2026-01-10 04:02:03.495104', '2026-01-10 04:02:03.495104');
INSERT INTO public.app_settings (id, setting_key, setting_value, created_at, updated_at) VALUES (1, 'smtp_enabled', 'false', '2026-01-08 11:29:25.441452', '2026-01-10 04:13:49.895534');
INSERT INTO public.app_settings (id, setting_key, setting_value, created_at, updated_at) VALUES (2, 'smtp_sender_email', '', '2026-01-08 11:29:25.588374', '2026-01-10 04:13:50.040271');
INSERT INTO public.app_settings (id, setting_key, setting_value, created_at, updated_at) VALUES (3, 'smtp_host', '', '2026-01-08 11:29:25.731315', '2026-01-10 04:13:50.183014');
INSERT INTO public.app_settings (id, setting_key, setting_value, created_at, updated_at) VALUES (4, 'smtp_port', '587', '2026-01-08 11:29:25.875743', '2026-01-10 04:13:50.331884');
INSERT INTO public.app_settings (id, setting_key, setting_value, created_at, updated_at) VALUES (5, 'smtp_user', '', '2026-01-08 11:29:26.02042', '2026-01-10 04:13:50.474455');
INSERT INTO public.app_settings (id, setting_key, setting_value, created_at, updated_at) VALUES (6, 'smtp_secure', 'tls', '2026-01-08 11:29:26.162874', '2026-01-10 04:13:50.619136');
-- Deprecated LLM key removed

-- Google OAuth settings removed for security in bootstrap

INSERT INTO public.app_settings (id, setting_key, setting_value, created_at, updated_at) VALUES (156, 'privacy_policy', '# Política de Privacidad de %APP_NAME%

**%EMPRESA_NAME%** ha desarrollado la aplicación **%APP_NAME%** como una aplicación de tipo gratuito/comercial. Este SERVICIO es proporcionado por **%EMPRESA_NAME%** y está diseñado para utilizarse tal cual.

---

### 1. Recopilación y Uso de la Información
Para una mejor experiencia al usar nuestro Servicio, es posible que le solicitemos que nos proporcione cierta información de identificación personal. La información que solicitamos será retenida por nosotros y utilizada como se describe en esta política de privacidad.

> **Servicios de Terceros:** La aplicación utiliza servicios de terceros que pueden recopilar información utilizada para identificarlo (por ejemplo, Google Play Services, Google Analytics o AdMob).

### 2. Datos de Registro (Log Data)
Queremos informarle que cada vez que utiliza nuestro Servicio, en caso de error en la aplicación, recopilamos datos e información (a través de productos de terceros) en su dispositivo denominados **Datos de Registro**. 

Estos datos pueden incluir:
* Dirección de Protocolo de Internet ("IP") de su dispositivo.
* Nombre del dispositivo y versión del sistema operativo.
* Configuración de la aplicación al utilizar nuestro servicio.
* Hora y fecha de uso, además de otras estadísticas.

### 3. Seguridad
Valoramos su confianza al proporcionarnos su información personal, por lo que nos esforzamos por utilizar medios comercialmente aceptables para protegerla. Sin embargo, recuerde que ningún método de transmisión por Internet o método de almacenamiento electrónico es **100% seguro y confiable**, por lo que no podemos garantizar su seguridad absoluta.

### 4. Cambios en esta Política de Privacidad
Es posible que actualicemos nuestra Política de Privacidad de vez en cuando. Por lo tanto, se le recomienda revisar esta página periódicamente para verificar cualquier cambio. Le notificaremos cualquier modificación publicando la nueva Política de Privacidad en esta sección.

### 5. Contáctenos
Si tiene alguna pregunta o sugerencia sobre nuestra Política de Privacidad, no dude en contactarnos en:  
📧 **%SUPPORT_EMAIL%**', '2026-01-10 13:33:51.216155', '2026-01-11 23:38:22.156714');
INSERT INTO public.app_settings (id, setting_key, setting_value, created_at, updated_at) VALUES (7, 'app_name', 'Cetosis', '2026-01-08 11:29:26.307628', '2026-01-13 07:06:56.654316');
INSERT INTO public.app_settings (id, setting_key, setting_value, created_at, updated_at) VALUES (166, 'company_name', 'Espalhar Digital 2025', '2026-01-10 23:23:50.243143', '2026-01-13 07:06:56.660128');
INSERT INTO public.app_settings (id, setting_key, setting_value, created_at, updated_at) VALUES (198, 'support_email', 'soporte@n6nprueba.shop', '2026-01-11 18:08:03.275542', '2026-01-13 07:06:56.663849');
INSERT INTO public.app_settings (id, setting_key, setting_value, created_at, updated_at) VALUES (8, 'app_favicon_url', 'https://files.n8nprueba.shop/pruebas/system/app-favicon-1768206695639.png', '2026-01-08 11:29:26.452349', '2026-01-13 07:06:56.66841');
INSERT INTO public.app_settings (id, setting_key, setting_value, created_at, updated_at) VALUES (109, 'app_version', '0.2.0 Beta  ', '2026-01-10 03:05:25.677319', '2026-01-13 07:06:56.672428');
INSERT INTO public.app_settings (id, setting_key, setting_value, created_at, updated_at) VALUES (110, 'footer_text', '© 2026 probando Todos los derechos reservados   ', '2026-01-10 03:05:25.821756', '2026-01-13 07:06:56.676599');
INSERT INTO public.app_settings (id, setting_key, setting_value, created_at, updated_at) VALUES (119, 'rate_limit_avatar_enabled', 'false', '2026-01-10 03:44:39.703618', '2026-01-13 07:06:56.680437');
INSERT INTO public.app_settings (id, setting_key, setting_value, created_at, updated_at) VALUES (120, 'rate_limit_password_enabled', 'false', '2026-01-10 03:44:39.847406', '2026-01-13 07:06:56.683746');
INSERT INTO public.app_settings (id, setting_key, setting_value, created_at, updated_at) VALUES (121, 'rate_limit_login_enabled', 'false', '2026-01-10 03:44:39.992233', '2026-01-13 07:06:56.68675');
INSERT INTO public.app_settings (id, setting_key, setting_value, created_at, updated_at) VALUES (155, 'terms_conditions', '# Términos y Condiciones de %APP_NAME%

Bienvenido a **%APP_NAME%**. Al descargar o utilizar la aplicación, usted acepta automáticamente estos términos. Asegúrese de leerlos atentamente antes de usar la aplicación.

---

### 1. Uso de la Aplicación
Se le concede una licencia limitada, no exclusiva e intransferible para usar la aplicación únicamente con fines **personales y no comerciales**. No está permitido:
* Copiar ni modificar la aplicación ni ninguna parte de la misma.
* Utilizar nuestras marcas comerciales de ninguna manera.

### 2. Propiedad Intelectual
La aplicación y todo el contenido relacionado (diseño, texto, gráficos) son propiedad de **%EMPRESA_NAME%**. Queda estrictamente prohibido:
* Intentar extraer el código fuente de la aplicación.
* Traducir la aplicación a otros idiomas.
* Crear versiones derivadas de la misma.

### 3. Actualizaciones y Cambios
Nos comprometemos a asegurar que la aplicación sea lo más útil y eficiente posible. Por ello, nos reservamos el derecho de realizar cambios en la aplicación o cobrar por sus servicios en cualquier momento y por cualquier motivo. 

> **Nota:** Nunca le cobraremos por la aplicación o sus servicios sin que tenga muy claro exactamente qué está pagando.

### 4. Limitación de Responsabilidad
La aplicación se proporciona **"tal cual"** y **"según disponibilidad"**. **%EMPRESA_NAME%** no se hace responsable de:
* Errores u omisiones en el contenido.
* Cualquier daño derivado del uso de la aplicación.

### 5. Contacto
Si tiene alguna pregunta o sugerencia sobre nuestros Términos y Condiciones, no dude en contactarnos en:  
📧 **%SUPPORT_EMAIL%**', '2026-01-10 13:33:51.069028', '2026-01-11 23:38:22.008117');


--
-- Data for Name: email_templates; Type: TABLE DATA; Schema: public; Owner: amilcar_Usuario
--

INSERT INTO public.email_templates (id, template_key, sender_name, sender_email, reply_to, subject, body_html, body_text, created_at, updated_at) VALUES (3, 'email_change', 'Citosis', 'noreply@example.com', 'noreply', 'Confirma tu nueva dirección de correo en %APP_NAME%', 'Hola, %DISPLAY_NAME%:

Recibimos una solicitud para cambiar la dirección de correo electrónico asociada a tu cuenta en %APP_NAME%. Para completar el proceso, por favor confirma tu nueva dirección haciendo clic en el siguiente enlace:

%LINK%

Nota de seguridad: Si no solicitaste este cambio, por favor ignora este mensaje o contacta con nuestro equipo de soporte para asegurar tu cuenta.

Saludos,

El equipo de %APP_NAME%', '', '2026-01-11 21:52:54.872419', '2026-01-11 21:52:54.872419');
INSERT INTO public.email_templates (id, template_key, sender_name, sender_email, reply_to, subject, body_html, body_text, created_at, updated_at) VALUES (1, 'password_reset', 'Citosis', 'noreply@example.com', 'noreply', 'Restablece tu contraseña para %APP_NAME%', 'Hola, %DISPLAY_NAME%:

Haz clic en el siguiente enlace para restablecer tu contraseña.

%LINK%

Si no solicitaste restablecer tu contraseña, ignora este correo.

Gracias.

El equipo de %APP_NAME%', '', '2026-01-08 00:37:20.536488', '2026-01-11 22:11:24.585224');
INSERT INTO public.email_templates (id, template_key, sender_name, sender_email, reply_to, subject, body_html, body_text, created_at, updated_at) VALUES (2, 'email_verification', 'ana', 'citosis@n8nprueba.shop', 'noreply', 'Confirma tu correo para empezar en %APP_NAME%', '¡Gracias por unirte a %APP_NAME%! 
Para completar tu registro y asegurar tu cuenta, por favor confirma tu dirección de correo electrónico haciendo clic en el siguiente enlace:

%LINK%

Si no has creado una cuenta, puedes ignorar este mensaje con total tranquilidad; no se realizará ninguna acción.

Saludos,

El equipo de %APP_NAME%', '', '2026-01-10 04:40:46.384697', '2026-01-11 23:42:21.136649');


--
-- Data for Name: translations; Type: TABLE DATA; Schema: public; Owner: amilcar_Usuario
--

INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (1, 'common.save', 'common', '{"en": "Save", "es": "Guardar", "pt": "Salvar"}', '2026-01-10 13:18:25.910764');
INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (72, 'auth.subtitle_login', 'auth', '{"en": "Log in to continue learning", "es": "Inicia sesión para continuar aprendiendo", "pt": "Entre para continuar aprendendo"}', '2026-01-10 13:47:27.031013');
INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (73, 'auth.subtitle_register', 'auth', '{"en": "Create your account to start", "es": "Crea tu cuenta para comenzar", "pt": "Crie sua conta para começar"}', '2026-01-10 13:47:27.031013');
INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (74, 'auth.email_label', 'auth', '{"en": "Email", "es": "Email", "pt": "E-mail"}', '2026-01-10 13:47:27.031013');
INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (75, 'auth.password_label', 'auth', '{"en": "Password", "es": "Contraseña", "pt": "Senha"}', '2026-01-10 13:47:27.031013');
INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (76, 'auth.forgot_password_link', 'auth', '{"en": "Forgot your password?", "es": "¿Olvidaste tu contraseña?", "pt": "Esqueceu sua senha?"}', '2026-01-10 13:47:27.031013');
INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (78, 'auth.register_button', 'auth', '{"en": "Register", "es": "Registrarse", "pt": "Cadastrar-se"}', '2026-01-10 13:47:27.031013');
INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (79, 'auth.or_continue', 'auth', '{"en": "Or continue with", "es": "O continúa con", "pt": "Ou continue com"}', '2026-01-10 13:47:27.031013');
INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (80, 'auth.no_account_question', 'auth', '{"en": "Don''t have an account?", "es": "¿No tienes cuenta?", "pt": "Não tem conta?"}', '2026-01-10 13:47:27.031013');
INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (81, 'auth.has_account_question', 'auth', '{"en": "Already have an account?", "es": "¿Ya tienes cuenta?", "pt": "Já tem conta?"}', '2026-01-10 13:47:27.031013');
INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (82, 'auth.register_action', 'auth', '{"en": "Sign up", "es": "Regístrate", "pt": "Cadastre-se"}', '2026-01-10 13:47:27.031013');
INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (83, 'auth.login_action', 'auth', '{"en": "Login", "es": "Inicia Sesión", "pt": "Entrar"}', '2026-01-10 13:47:27.031013');
INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (84, 'auth.config_required', 'auth', '{"en": "Configuration Required", "es": "Configuración Requerida", "pt": "Configuração Necessária"}', '2026-01-10 13:47:27.031013');
INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (85, 'auth.google_not_configured', 'auth', '{"en": "Google authentication is not configured.", "es": "La autenticación con Google no está configurada.", "pt": "A autenticação do Google não está configurada."}', '2026-01-10 13:47:27.031013');
INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (77, 'auth.login_button', 'auth', '{"en": "Log In", "es": "Iniciar Sesión", "pt": "Entrar"}', '2026-01-10 13:47:27.031013');
INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (99, 'auth.forgot_password', 'auth', '{"en": "Forgot your password?", "es": "¿Olvidaste tu contraseña?", "pt": "Esqueceu sua senha?"}', '2026-01-10 13:59:58.285713');
INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (100, 'auth.register_link', 'auth', '{"en": "No account? Sign up", "es": "¿No tienes cuenta? Regístrate", "pt": "Não tem conta? Cadastre-se"}', '2026-01-10 13:59:58.285713');
INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (101, 'auth.error.invalid_credentials', 'auth', '{"en": "Invalid credentials", "es": "Credenciales inválidas", "pt": "Credenciais inválidas"}', '2026-01-10 13:59:58.285713');
INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (102, 'auth.error.verify_email', 'auth', '{"en": "You must verify your email before logging in", "es": "Debes verificar tu email antes de iniciar sesión", "pt": "Você deve verificar seu e-mail antes de entrar"}', '2026-01-10 13:59:58.285713');
INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (103, 'dashboard.welcome_user', 'dashboard', '{"en": "Hello, {name}!", "es": "¡Hola, {name}!", "pt": "Olá, {name}!"}', '2026-01-10 13:59:58.285713');
INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (104, 'dashboard.subtitle', 'dashboard', '{"en": "Welcome to your user dashboard. You will be able to access your courses and progress here soon.", "es": "Bienvenido a tu panel de usuario. Aquí podrás acceder a tus cursos y progreso próximamente.", "pt": "Bem-vindo ao seu painel de usuário. Você poderá acessar seus cursos e progresso aqui em breve."}', '2026-01-10 13:59:58.285713');
INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (105, 'dashboard.stats.level', 'dashboard', '{"en": "Current Level", "es": "Nivel Actual", "pt": "Nível Atual"}', '2026-01-10 13:59:58.285713');
INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (106, 'dashboard.stats.level_value', 'dashboard', '{"en": "Beginner", "es": "Principiante", "pt": "Iniciante"}', '2026-01-10 13:59:58.285713');
INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (107, 'dashboard.stats.lessons', 'dashboard', '{"en": "Lessons Completed", "es": "Lecciones Completadas", "pt": "Lições Completadas"}', '2026-01-10 13:59:58.285713');
INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (108, 'dashboard.stats.streak', 'dashboard', '{"en": "Streak", "es": "Racha", "pt": "Sequência"}', '2026-01-10 13:59:58.285713');
INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (109, 'dashboard.stats.days', 'dashboard', '{"en": "Days", "es": "Días", "pt": "Dias"}', '2026-01-10 13:59:58.285713');
INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (86, 'admin.system_management', 'admin', '{"en": "System Management", "es": "Gestión del Sistema", "pt": "Gestão do Sistema"}', '2026-01-10 13:47:27.031013');
INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (91, 'admin.theme', 'admin', '{"en": "Theme", "es": "Tema", "pt": "Tema"}', '2026-01-10 13:47:27.031013');
INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (92, 'admin.view_as_user', 'admin', '{"en": "View as User", "es": "Ver como Usuario", "pt": "Ver como Usuário"}', '2026-01-10 13:47:27.031013');
INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (93, 'admin.logout', 'admin', '{"en": "Logout", "es": "Cerrar Sesión", "pt": "Sair"}', '2026-01-10 13:47:27.031013');
INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (71, 'auth.welcome', 'auth', '{"en": "Welcome", "es": "Bienvenido", "pt": "Bem-vindo"}', '2026-01-10 13:47:27.031013');
INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (95, 'auth.login_subtitle', 'auth', '{"en": "Log in to continue learning", "es": "Inicia sesión para continuar aprendiendo", "pt": "Faça login para continuar aprendendo"}', '2026-01-10 13:59:58.285713');
INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (96, 'auth.email', 'auth', '{"en": "Email", "es": "Email", "pt": "Email"}', '2026-01-10 13:59:58.285713');
INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (97, 'auth.password', 'auth', '{"en": "Password", "es": "Contraseña", "pt": "Senha"}', '2026-01-10 13:59:58.285713');
INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (2, 'common.cancel', 'common', '{"en": "Cancel", "es": "Cancelar", "pt": "Cancelar"}', '2026-01-10 13:18:25.910764');
INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (111, 'settings.tabs.profile', 'settings', '{"en": "Profile", "es": "Perfil", "pt": "Perfil"}', '2026-01-10 13:59:58.285713');
INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (112, 'settings.tabs.security', 'settings', '{"en": "Security", "es": "Seguridad", "pt": "Segurança"}', '2026-01-10 13:59:58.285713');
INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (113, 'settings.tabs.preferences', 'settings', '{"en": "Preferences", "es": "Preferencias", "pt": "Preferências"}', '2026-01-10 13:59:58.285713');
INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (114, 'settings.tabs.info', 'settings', '{"en": "Information", "es": "Información", "pt": "Informações"}', '2026-01-10 13:59:58.285713');
INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (115, 'settings.profile.change_photo', 'settings', '{"en": "Change photo", "es": "Cambiar foto", "pt": "Alterar foto"}', '2026-01-10 13:59:58.285713');
INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (116, 'settings.profile.delete_photo', 'settings', '{"en": "Delete photo", "es": "Eliminar foto", "pt": "Excluir foto"}', '2026-01-10 13:59:58.285713');
INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (117, 'settings.profile.name_label', 'settings', '{"en": "Full Name", "es": "Nombre Completo", "pt": "Nome Completo"}', '2026-01-10 13:59:58.285713');
INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (118, 'settings.profile.email_label', 'settings', '{"en": "Email Address", "es": "Correo Electrónico", "pt": "Endereço de E-mail"}', '2026-01-10 13:59:58.285713');
INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (119, 'settings.profile.email_hint', 'settings', '{"en": "To change your email, use the specific security option.", "es": "Para cambiar tu email, usa la opción específica de seguridad.", "pt": "Para alterar seu e-mail, use a opção de segurança específica."}', '2026-01-10 13:59:58.285713');
INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (120, 'settings.profile.save', 'settings', '{"en": "Save Changes", "es": "Guardar Cambios", "pt": "Salvar Alterações"}', '2026-01-10 13:59:58.285713');
INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (121, 'settings.profile.saving', 'settings', '{"en": "Saving...", "es": "Guardando...", "pt": "Salvando..."}', '2026-01-10 13:59:58.285713');
INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (122, 'settings.profile.success', 'settings', '{"en": "Profile updated", "es": "Perfil actualizado", "pt": "Perfil atualizado"}', '2026-01-10 13:59:58.285713');
INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (123, 'settings.security.change_password', 'settings', '{"en": "Change Password", "es": "Cambiar Contraseña", "pt": "Alterar Senha"}', '2026-01-10 13:59:58.285713');
INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (124, 'settings.security.current_password', 'settings', '{"en": "Current Password", "es": "Contraseña Actual", "pt": "Senha Atual"}', '2026-01-10 13:59:58.285713');
INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (125, 'settings.security.new_password', 'settings', '{"en": "New Password", "es": "Nueva Contraseña", "pt": "Nova Senha"}', '2026-01-10 13:59:58.285713');
INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (126, 'settings.security.confirm_password', 'settings', '{"en": "Confirm New Password", "es": "Confirmar Nueva Contraseña", "pt": "Confirmar Nova Senha"}', '2026-01-10 13:59:58.285713');
INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (127, 'settings.security.update_btn', 'settings', '{"en": "Update Password", "es": "Actualizar Contraseña", "pt": "Atualizar Senha"}', '2026-01-10 13:59:58.285713');
INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (128, 'settings.security.updating', 'settings', '{"en": "Updating...", "es": "Actualizando...", "pt": "Atualizando..."}', '2026-01-10 13:59:58.285713');
INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (129, 'settings.security.danger_zone', 'settings', '{"en": "Danger Zone", "es": "Zona de Peligro", "pt": "Zona de Perigo"}', '2026-01-10 13:59:58.285713');
INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (130, 'settings.security.delete_account', 'settings', '{"en": "Delete Account", "es": "Eliminar Cuenta", "pt": "Excluir Conta"}', '2026-01-10 13:59:58.285713');
INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (131, 'settings.security.delete_warning', 'settings', '{"en": "This action is permanent and cannot be undone.", "es": "Esta acción es permanente y no se puede deshacer.", "pt": "Esta ação é permanente e não pode ser desfeita."}', '2026-01-10 13:59:58.285713');
INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (132, 'settings.security.delete_btn', 'settings', '{"en": "Delete my account", "es": "Eliminar mi cuenta", "pt": "Excluir minha conta"}', '2026-01-10 13:59:58.285713');
INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (133, 'settings.security.password_mismatch', 'settings', '{"en": "Passwords do not match", "es": "Las contraseñas no coinciden", "pt": "As senhas não coincidem"}', '2026-01-10 13:59:58.285713');
INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (134, 'settings.security.success', 'settings', '{"en": "Password updated successfully", "es": "Contraseña actualizada correctamente", "pt": "Senha atualizada com sucesso"}', '2026-01-10 13:59:58.285713');
INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (3, 'common.loading', 'common', '{"en": "Loading...", "es": "Cargando...", "pt": "Carregando..."}', '2026-01-10 13:18:25.910764');
INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (136, 'settings.darkMode_desc', 'settings', '{"en": "Change application appearance.", "es": "Cambiar la apariencia de la aplicación.", "pt": "Mudar a aparência do aplicativo."}', '2026-01-10 13:59:58.285713');
INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (4, 'common.error', 'common', '{"en": "Error", "es": "Error", "pt": "Erro"}', '2026-01-10 13:18:25.910764');
INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (138, 'settings.language_desc', 'settings', '{"en": "Select interface language.", "es": "Selecciona el idioma de la interfaz.", "pt": "Selecione o idioma da interface."}', '2026-01-10 13:59:58.285713');
INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (139, 'settings.info.terms', 'settings', '{"en": "Terms & Conditions", "es": "Términos y Condiciones", "pt": "Termos e Condições"}', '2026-01-10 13:59:58.285713');
INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (140, 'settings.info.privacy', 'settings', '{"en": "Privacy Policy", "es": "Política de Privacidad", "pt": "Política de Privacidade"}', '2026-01-10 13:59:58.285713');
INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (141, 'settings.info.footer', 'settings', '{"en": "All rights reserved.", "es": "Todos los derechos reservados.", "pt": "Todos os direitos reservados."}', '2026-01-10 13:59:58.285713');
INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (142, 'admin.sidebar.system', 'admin', '{"en": "SYSTEM MANAGEMENT", "es": "GESTIÓN DEL SISTEMA", "pt": "GESTÃO DO SISTEMA"}', '2026-01-10 13:59:58.285713');
INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (87, 'admin.menu.profile', 'admin', '{"en": "My Profile", "es": "Mi Perfil", "pt": "Meu Perfil"}', '2026-01-10 13:47:27.031013');
INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (88, 'admin.menu.users', 'admin', '{"en": "User Management", "es": "Gestión de Usuarios", "pt": "Gestão de Usuários"}', '2026-01-10 13:47:27.031013');
INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (89, 'admin.menu.general', 'admin', '{"en": "General Settings", "es": "Ajustes Generales", "pt": "Configurações Gerais"}', '2026-01-10 13:47:27.031013');
INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (90, 'admin.menu.google', 'admin', '{"en": "Google Authentication", "es": "Autenticación Google", "pt": "Autenticação Google"}', '2026-01-10 13:47:27.031013');
INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (147, 'admin.menu.logout', 'admin', '{"en": "Logout", "es": "Cerrar Sesión", "pt": "Sair"}', '2026-01-10 13:59:58.285713');
INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (148, 'admin.profile.view_as_user', 'admin', '{"en": "View as User", "es": "Ver como Usuario", "pt": "Ver como Usuário"}', '2026-01-10 13:59:58.285713');
INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (149, 'admin.profile.theme', 'admin', '{"en": "Theme", "es": "Tema", "pt": "Tema"}', '2026-01-10 13:59:58.285713');
INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (5, 'common.success', 'common', '{"en": "Success", "es": "Éxito", "pt": "Sucesso"}', '2026-01-10 13:18:25.910764');
INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (6, 'auth.login', 'auth', '{"en": "Log In", "es": "Iniciar Sesión", "pt": "Entrar"}', '2026-01-10 13:18:25.910764');
INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (7, 'auth.logout', 'auth', '{"en": "Log Out", "es": "Cerrar Sesión", "pt": "Sair"}', '2026-01-10 13:18:25.910764');
INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (13, 'settings.preferences', 'settings', '{"en": "Preferences", "es": "Preferencias", "pt": "Preferências"}', '2026-01-10 13:18:25.910764');
INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (14, 'settings.info', 'settings', '{"en": "Info", "es": "Información", "pt": "Informações"}', '2026-01-10 13:18:25.910764');
INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (8, 'settings.title', 'settings', '{"en": "Account Settings", "es": "Configuración de Cuenta", "pt": "Configurações da Conta"}', '2026-01-10 13:18:25.910764');
INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (9, 'settings.darkMode', 'settings', '{"en": "Dark Mode", "es": "Modo Oscuro", "pt": "Modo Escuro"}', '2026-01-10 13:18:25.910764');
INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (10, 'settings.language', 'settings', '{"en": "Language", "es": "Idioma", "pt": "Idioma"}', '2026-01-10 13:18:25.910764');
INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (11, 'settings.profile', 'settings', '{"en": "Profile", "es": "Perfil", "pt": "Perfil"}', '2026-01-10 13:18:25.910764');
INSERT INTO public.translations (id, key, category, translations, updated_at) VALUES (12, 'settings.security', 'settings', '{"en": "Security", "es": "Seguridad", "pt": "Segurança"}', '2026-01-10 13:18:25.910764');


--
-- Name: advanced_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: amilcar_Usuario
--

SELECT pg_catalog.setval('public.advanced_settings_id_seq', 171, true);


--
-- Name: app_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: amilcar_Usuario
--

SELECT pg_catalog.setval('public.app_settings_id_seq', 390, true);


--
-- Name: email_templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: amilcar_Usuario
--

SELECT pg_catalog.setval('public.email_templates_id_seq', 3, true);


--
-- Name: translations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: amilcar_Usuario
--

SELECT pg_catalog.setval('public.translations_id_seq', 1493, true);


--
-- PostgreSQL database dump complete
--

\unrestrict rPVaaOmpGgr1GOD4IE3zAfiIx6YBz5MSDuAbWr05pqvm9y8hFd82mc3yAnZ5O2r
