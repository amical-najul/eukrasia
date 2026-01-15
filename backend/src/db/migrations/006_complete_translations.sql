-- Migration: 006_complete_translations.sql
-- Description: Add all missing translation keys for ES/EN/PT
-- Date: 2026-01-15
-- Covers: Settings modal, Dashboard, Breathing, Metabolic, Sleep, Mind modules

BEGIN;

-- =====================================================
-- SETTINGS MODAL - TABS
-- =====================================================
INSERT INTO translations (key, category, translations) VALUES
('settings.tabs.profile', 'settings', '{"es": "Perfil", "pt": "Perfil", "en": "Profile"}'),
('settings.tabs.security', 'settings', '{"es": "Seguridad", "pt": "Segurança", "en": "Security"}'),
('settings.tabs.preferences', 'settings', '{"es": "Preferencias", "pt": "Preferências", "en": "Preferences"}'),
('settings.tabs.info', 'settings', '{"es": "Información", "pt": "Informação", "en": "Information"}')
ON CONFLICT (key) DO UPDATE SET translations = EXCLUDED.translations, updated_at = CURRENT_TIMESTAMP;

-- =====================================================
-- SETTINGS MODAL - PROFILE
-- =====================================================
INSERT INTO translations (key, category, translations) VALUES
('settings.profile.change_photo', 'settings', '{"es": "Cambiar foto", "pt": "Alterar foto", "en": "Change photo"}'),
('settings.profile.name_label', 'settings', '{"es": "Nombre completo", "pt": "Nome completo", "en": "Full name"}'),
('settings.profile.email_label', 'settings', '{"es": "Correo electrónico", "pt": "E-mail", "en": "Email"}'),
('settings.profile.email_hint', 'settings', '{"es": "El correo no puede ser modificado directamente.", "pt": "O e-mail não pode ser modificado diretamente.", "en": "Email cannot be modified directly."}'),
('settings.profile.saving', 'settings', '{"es": "Guardando...", "pt": "Salvando...", "en": "Saving..."}'),
('settings.profile.save', 'settings', '{"es": "Guardar Cambios", "pt": "Salvar Alterações", "en": "Save Changes"}')
ON CONFLICT (key) DO UPDATE SET translations = EXCLUDED.translations, updated_at = CURRENT_TIMESTAMP;

-- =====================================================
-- SETTINGS MODAL - SECURITY
-- =====================================================
INSERT INTO translations (key, category, translations) VALUES
('settings.security.change_password', 'settings', '{"es": "Cambiar Contraseña", "pt": "Alterar Senha", "en": "Change Password"}'),
('settings.security.current_password', 'settings', '{"es": "Contraseña actual", "pt": "Senha atual", "en": "Current password"}'),
('settings.security.new_password', 'settings', '{"es": "Nueva contraseña", "pt": "Nova senha", "en": "New password"}'),
('settings.security.confirm_password', 'settings', '{"es": "Confirmar nueva contraseña", "pt": "Confirmar nova senha", "en": "Confirm new password"}'),
('settings.security.updating', 'settings', '{"es": "Actualizando...", "pt": "Atualizando...", "en": "Updating..."}'),
('settings.security.update_btn', 'settings', '{"es": "Actualizar Contraseña", "pt": "Atualizar Senha", "en": "Update Password"}'),
('settings.security.delete_account', 'settings', '{"es": "Eliminar Cuenta", "pt": "Excluir Conta", "en": "Delete Account"}'),
('settings.security.delete_warning', 'settings', '{"es": "Esta acción es irreversible. Todos tus datos serán eliminados.", "pt": "Esta ação é irreversível. Todos os seus dados serão excluídos.", "en": "This action is irreversible. All your data will be deleted."}'),
('settings.security.delete_btn', 'settings', '{"es": "Eliminar mi cuenta", "pt": "Excluir minha conta", "en": "Delete my account"}')
ON CONFLICT (key) DO UPDATE SET translations = EXCLUDED.translations, updated_at = CURRENT_TIMESTAMP;

-- =====================================================
-- SETTINGS MODAL - PREFERENCES
-- =====================================================
INSERT INTO translations (key, category, translations) VALUES
('settings.darkMode', 'settings', '{"es": "Modo Oscuro", "pt": "Modo Escuro", "en": "Dark Mode"}'),
('settings.darkMode_desc', 'settings', '{"es": "Cambiar la apariencia de la aplicación.", "pt": "Alterar a aparência do aplicativo.", "en": "Change the appearance of the application."}'),
('settings.language', 'settings', '{"es": "Idioma", "pt": "Idioma", "en": "Language"}'),
('settings.language_desc', 'settings', '{"es": "Selecciona el idioma de la interfaz.", "pt": "Selecione o idioma da interface.", "en": "Select the interface language."}'),
('settings.dashboardLayout', 'settings', '{"es": "Estilo del Dashboard", "pt": "Estilo do Painel", "en": "Dashboard Style"}'),
('settings.dashboardLayout_desc', 'settings', '{"es": "Cambiar entre vista de hexágonos y lista.", "pt": "Alternar entre visualização hexagonal e lista.", "en": "Switch between hexagon and list view."}')
ON CONFLICT (key) DO UPDATE SET translations = EXCLUDED.translations, updated_at = CURRENT_TIMESTAMP;

-- =====================================================
-- SETTINGS MODAL - INFO
-- =====================================================
INSERT INTO translations (key, category, translations) VALUES
('settings.info.terms', 'settings', '{"es": "Términos de Servicio", "pt": "Termos de Serviço", "en": "Terms of Service"}'),
('settings.info.privacy', 'settings', '{"es": "Política de Privacidad", "pt": "Política de Privacidade", "en": "Privacy Policy"}'),
('settings.info.footer', 'settings', '{"es": "Todos los derechos reservados.", "pt": "Todos os direitos reservados.", "en": "All rights reserved."}')
ON CONFLICT (key) DO UPDATE SET translations = EXCLUDED.translations, updated_at = CURRENT_TIMESTAMP;

-- =====================================================
-- USER DASHBOARD - MODULES
-- =====================================================
INSERT INTO translations (key, category, translations) VALUES
('dashboard.modules.breathing', 'dashboard', '{"es": "Respiración Consciente", "pt": "Respiração Consciente", "en": "Conscious Breathing"}'),
('dashboard.modules.breathing_desc', 'dashboard', '{"es": "Técnica Wim Hof para oxigenación profunda", "pt": "Técnica Wim Hof para oxigenação profunda", "en": "Wim Hof technique for deep oxygenation"}'),
('dashboard.modules.sleep', 'dashboard', '{"es": "Sueño Reparador", "pt": "Sono Reparador", "en": "Restorative Sleep"}'),
('dashboard.modules.sleep_desc', 'dashboard', '{"es": "Monitoreo de calidad del descanso nocturno", "pt": "Monitoramento da qualidade do descanso noturno", "en": "Nighttime rest quality monitoring"}'),
('dashboard.modules.metabolic', 'dashboard', '{"es": "Laboratorio Metabólico", "pt": "Laboratório Metabólico", "en": "Metabolic Lab"}'),
('dashboard.modules.metabolic_desc', 'dashboard', '{"es": "Control de ayuno y alimentación consciente", "pt": "Controle de jejum e alimentação consciente", "en": "Fasting and mindful eating control"}'),
('dashboard.modules.mind', 'dashboard', '{"es": "Poder de la Mente", "pt": "Poder da Mente", "en": "Mind Power"}'),
('dashboard.modules.mind_desc', 'dashboard', '{"es": "Meditación Trataka para concentración profunda", "pt": "Meditação Trataka para concentração profunda", "en": "Trataka meditation for deep focus"}'),
('dashboard.modules.nutrition', 'dashboard', '{"es": "Nutrición Balanceada", "pt": "Nutrição Balanceada", "en": "Balanced Nutrition"}'),
('dashboard.modules.nutrition_desc', 'dashboard', '{"es": "Planificación de alimentación saludable", "pt": "Planejamento de alimentação saudável", "en": "Healthy meal planning"}'),
('dashboard.modules.activity', 'dashboard', '{"es": "Actividad Física", "pt": "Atividade Física", "en": "Physical Activity"}'),
('dashboard.modules.activity_desc', 'dashboard', '{"es": "Rutinas de ejercicio personalizadas", "pt": "Rotinas de exercícios personalizadas", "en": "Personalized workout routines"}'),
('dashboard.modules.coming_soon', 'dashboard', '{"es": "Próximamente", "pt": "Em breve", "en": "Coming Soon"}')
ON CONFLICT (key) DO UPDATE SET translations = EXCLUDED.translations, updated_at = CURRENT_TIMESTAMP;

-- =====================================================
-- BREATHING MODULE
-- =====================================================
INSERT INTO translations (key, category, translations) VALUES
('breathing.title', 'breathing', '{"es": "Respiración Consciente", "pt": "Respiração Consciente", "en": "Conscious Breathing"}'),
('breathing.guided', 'breathing', '{"es": "Respiración Guiada", "pt": "Respiração Guiada", "en": "Guided Breathing"}'),
('breathing.guided_desc', 'breathing', '{"es": "Sesión completa con retención", "pt": "Sessão completa com retenção", "en": "Full session with retention"}'),
('breathing.retention', 'breathing', '{"es": "Solo Retención", "pt": "Apenas Retenção", "en": "Retention Only"}'),
('breathing.retention_desc', 'breathing', '{"es": "Practica tu retención de aire", "pt": "Pratique sua retenção de ar", "en": "Practice your breath hold"}'),
('breathing.cold', 'breathing', '{"es": "Exposición al Frío", "pt": "Exposição ao Frio", "en": "Cold Exposure"}'),
('breathing.cold_desc', 'breathing', '{"es": "Timer para duchas frías", "pt": "Timer para banhos frios", "en": "Cold shower timer"}'),
('breathing.rounds', 'breathing', '{"es": "Rondas", "pt": "Rodadas", "en": "Rounds"}'),
('breathing.breaths', 'breathing', '{"es": "Respiraciones", "pt": "Respirações", "en": "Breaths"}'),
('breathing.speed', 'breathing', '{"es": "Velocidad", "pt": "Velocidade", "en": "Speed"}'),
('breathing.slow', 'breathing', '{"es": "Lento", "pt": "Lento", "en": "Slow"}'),
('breathing.standard', 'breathing', '{"es": "Estándar", "pt": "Padrão", "en": "Standard"}'),
('breathing.fast', 'breathing', '{"es": "Rápido", "pt": "Rápido", "en": "Fast"}'),
('breathing.inhale', 'breathing', '{"es": "Inhala", "pt": "Inspire", "en": "Inhale"}'),
('breathing.exhale', 'breathing', '{"es": "Exhala", "pt": "Expire", "en": "Exhale"}'),
('breathing.hold', 'breathing', '{"es": "Retener", "pt": "Reter", "en": "Hold"}'),
('breathing.recovery', 'breathing', '{"es": "Recuperación", "pt": "Recuperação", "en": "Recovery"}'),
('breathing.round_complete', 'breathing', '{"es": "Ronda Completada", "pt": "Rodada Concluída", "en": "Round Complete"}'),
('breathing.session_complete', 'breathing', '{"es": "Sesión Completada", "pt": "Sessão Concluída", "en": "Session Complete"}'),
('breathing.start', 'breathing', '{"es": "Iniciar Sesión", "pt": "Iniciar Sessão", "en": "Start Session"}'),
('breathing.stop', 'breathing', '{"es": "Detener", "pt": "Parar", "en": "Stop"}')
ON CONFLICT (key) DO UPDATE SET translations = EXCLUDED.translations, updated_at = CURRENT_TIMESTAMP;

-- =====================================================
-- METABOLIC MODULE
-- =====================================================
INSERT INTO translations (key, category, translations) VALUES
('metabolic.title', 'metabolic', '{"es": "Laboratorio Metabólico", "pt": "Laboratório Metabólico", "en": "Metabolic Lab"}'),
('metabolic.subtitle', 'metabolic', '{"es": "Registro de alta precisión", "pt": "Registro de alta precisão", "en": "High precision tracking"}'),
('metabolic.tab_nutrition', 'metabolic', '{"es": "Nutrición", "pt": "Nutrição", "en": "Nutrition"}'),
('metabolic.tab_fasting', 'metabolic', '{"es": "Estado Ayuno", "pt": "Estado Jejum", "en": "Fasting Status"}'),
('metabolic.time_since_meal', 'metabolic', '{"es": "Tiempo desde comida", "pt": "Tempo desde refeição", "en": "Time since meal"}'),
('metabolic.fasting_phase', 'metabolic', '{"es": "Fase de Ayuno", "pt": "Fase de Jejum", "en": "Fasting Phase"}'),
('metabolic.log_note', 'metabolic', '{"es": "Registrar Nota / Estado", "pt": "Registrar Nota / Estado", "en": "Log Note / Status"}'),
('metabolic.history', 'metabolic', '{"es": "Últimos Eventos", "pt": "Últimos Eventos", "en": "Latest Events"}'),
('metabolic.hydration', 'metabolic', '{"es": "Hidratación", "pt": "Hidratação", "en": "Hydration"}'),
('metabolic.supplements', 'metabolic', '{"es": "Suplementos", "pt": "Suplementos", "en": "Supplements"}'),
('metabolic.nutrition', 'metabolic', '{"es": "Nutrición", "pt": "Nutrição", "en": "Nutrition"}'),
('metabolic.confirm_consumption', 'metabolic', '{"es": "Confirmar Consumo", "pt": "Confirmar Consumo", "en": "Confirm Consumption"}'),
('metabolic.notes_placeholder', 'metabolic', '{"es": "Ej: 3 huevos cocidos, ensalada grande...", "pt": "Ex: 3 ovos cozidos, salada grande...", "en": "Ex: 3 boiled eggs, large salad..."}'),
('metabolic.notes_label', 'metabolic', '{"es": "Notas (Opcional)", "pt": "Notas (Opcional)", "en": "Notes (Optional)"}')
ON CONFLICT (key) DO UPDATE SET translations = EXCLUDED.translations, updated_at = CURRENT_TIMESTAMP;

-- =====================================================
-- SLEEP MODULE
-- =====================================================
INSERT INTO translations (key, category, translations) VALUES
('sleep.title', 'sleep', '{"es": "Sueño Reparador", "pt": "Sono Reparador", "en": "Restorative Sleep"}'),
('sleep.subtitle', 'sleep', '{"es": "Monitoreo de descanso nocturno", "pt": "Monitoramento do descanso noturno", "en": "Nighttime rest monitoring"}'),
('sleep.start_tracking', 'sleep', '{"es": "Iniciar Seguimiento", "pt": "Iniciar Rastreamento", "en": "Start Tracking"}'),
('sleep.sleeping', 'sleep', '{"es": "Descansando...", "pt": "Descansando...", "en": "Sleeping..."}'),
('sleep.wake_up', 'sleep', '{"es": "Despertar", "pt": "Acordar", "en": "Wake Up"}'),
('sleep.cancel_session', 'sleep', '{"es": "Cancelar sesión incorrecta", "pt": "Cancelar sessão incorreta", "en": "Cancel incorrect session"}'),
('sleep.quality', 'sleep', '{"es": "Calidad del Sueño", "pt": "Qualidade do Sono", "en": "Sleep Quality"}'),
('sleep.symptoms', 'sleep', '{"es": "Síntomas", "pt": "Sintomas", "en": "Symptoms"}'),
('sleep.snoring', 'sleep', '{"es": "Ronquido Fuerte", "pt": "Ronco Forte", "en": "Loud Snoring"}'),
('sleep.choking', 'sleep', '{"es": "Sensación de Ahogo", "pt": "Sensação de Sufocamento", "en": "Choking Sensation"}'),
('sleep.dry_mouth', 'sleep', '{"es": "Boca Seca", "pt": "Boca Seca", "en": "Dry Mouth"}'),
('sleep.history', 'sleep', '{"es": "Historial de Sueño", "pt": "Histórico de Sono", "en": "Sleep History"}'),
('sleep.duration', 'sleep', '{"es": "Duración", "pt": "Duração", "en": "Duration"}'),
('sleep.apnea_warning', 'sleep', '{"es": "Posible Apnea Detectada", "pt": "Possível Apneia Detectada", "en": "Possible Apnea Detected"}')
ON CONFLICT (key) DO UPDATE SET translations = EXCLUDED.translations, updated_at = CURRENT_TIMESTAMP;

-- =====================================================
-- MIND MODULE (TRATAKA)
-- =====================================================
INSERT INTO translations (key, category, translations) VALUES
('mind.title', 'mind', '{"es": "Poder de la Mente", "pt": "Poder da Mente", "en": "Mind Power"}'),
('mind.subtitle', 'mind', '{"es": "Meditación Trataka", "pt": "Meditação Trataka", "en": "Trataka Meditation"}'),
('mind.focus_object', 'mind', '{"es": "Objeto de Enfoque", "pt": "Objeto de Foco", "en": "Focus Object"}'),
('mind.candle', 'mind', '{"es": "Vela", "pt": "Vela", "en": "Candle"}'),
('mind.moon', 'mind', '{"es": "Luna", "pt": "Lua", "en": "Moon"}'),
('mind.yantra', 'mind', '{"es": "Yantra", "pt": "Yantra", "en": "Yantra"}'),
('mind.dot', 'mind', '{"es": "Punto", "pt": "Ponto", "en": "Dot"}'),
('mind.duration', 'mind', '{"es": "Duración", "pt": "Duração", "en": "Duration"}'),
('mind.distractions', 'mind', '{"es": "Distracciones", "pt": "Distrações", "en": "Distractions"}'),
('mind.fix_gaze', 'mind', '{"es": "Fija la Mirada", "pt": "Fixe o Olhar", "en": "Fix Your Gaze"}'),
('mind.session_complete', 'mind', '{"es": "Sesión Completada", "pt": "Sessão Concluída", "en": "Session Complete"}'),
('mind.start_session', 'mind', '{"es": "Iniciar Sesión", "pt": "Iniciar Sessão", "en": "Start Session"}'),
('mind.history', 'mind', '{"es": "Historial de Sesiones", "pt": "Histórico de Sessões", "en": "Session History"}')
ON CONFLICT (key) DO UPDATE SET translations = EXCLUDED.translations, updated_at = CURRENT_TIMESTAMP;

-- =====================================================
-- COMMON ACTIONS (NEW)
-- =====================================================
INSERT INTO translations (key, category, translations) VALUES
('common.start', 'common', '{"es": "Iniciar", "pt": "Iniciar", "en": "Start"}'),
('common.stop', 'common', '{"es": "Detener", "pt": "Parar", "en": "Stop"}'),
('common.pause', 'common', '{"es": "Pausar", "pt": "Pausar", "en": "Pause"}'),
('common.resume', 'common', '{"es": "Reanudar", "pt": "Retomar", "en": "Resume"}'),
('common.finish', 'common', '{"es": "Finalizar", "pt": "Finalizar", "en": "Finish"}'),
('common.settings', 'common', '{"es": "Configuración", "pt": "Configurações", "en": "Settings"}'),
('common.history', 'common', '{"es": "Historial", "pt": "Histórico", "en": "History"}'),
('common.attention', 'common', '{"es": "Atención", "pt": "Atenção", "en": "Attention"}'),
('common.yes', 'common', '{"es": "Sí", "pt": "Sim", "en": "Yes"}'),
('common.no', 'common', '{"es": "No", "pt": "Não", "en": "No"}')
ON CONFLICT (key) DO UPDATE SET translations = EXCLUDED.translations, updated_at = CURRENT_TIMESTAMP;

COMMIT;
