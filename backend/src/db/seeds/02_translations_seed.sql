-- Translations for Sleep Tracker
INSERT INTO translations (key, category, translations) VALUES
('sleep.title', 'sleep', '{"es": "Sueño Reparador", "en": "Restorative Sleep", "pt": "Sono Reparador"}'::jsonb),
('sleep.subtitle', 'sleep', '{"es": "Monitoreo de Apnea y Descanso", "en": "Apnea & Rest Monitoring", "pt": "Monitoramento de Apneia e Descanso"}'::jsonb),
('sleep.ready_question', 'sleep', '{"es": "¿Listo para descansar?", "en": "Ready to rest?", "pt": "Pronto para descansar?"}'::jsonb),
('sleep.morning_checkin_link', 'sleep', '{"es": "Morning Check-in", "en": "Morning Check-in", "pt": "Check-in Matinal"}'::jsonb),
('sleep.start_button', 'sleep', '{"es": "IR A DORMIR", "en": "GO TO SLEEP", "pt": "IR DORMIR"}'::jsonb),
('sleep.resting_status', 'sleep', '{"es": "Descansando...", "en": "Resting...", "pt": "Descansando..."}'::jsonb),
('sleep.wake_up_button', 'sleep', '{"es": "DESPERTAR", "en": "WAKE UP", "pt": "ACORDAR"}'::jsonb),
('sleep.cancel_session', 'sleep', '{"es": "Cancelar sesión incorrecta", "en": "Cancel incorrect session", "pt": "Cancelar sessão incorreta"}'::jsonb),
('sleep.good_morning', 'sleep', '{"es": "¡Buenos días!", "en": "Good morning!", "pt": "Bom dia!"}'::jsonb),
('sleep.how_feeling', 'sleep', '{"es": "¿Cómo te sientes esta mañana?", "en": "How do you feel this morning?", "pt": "Como se sente esta manhã?"}'::jsonb),
('sleep.unusual_detection', 'sleep', '{"es": "¿DETECTASTE ALGO INUSUAL?", "en": "DID YOU DETECT ANYTHING UNUSUAL?", "pt": "DETECTOU ALGO INCOMUM?"}'::jsonb),
('sleep.dry_mouth', 'sleep', '{"es": "Boca seca / Sed intensa", "en": "Dry mouth / Intense thirst", "pt": "Boca seca / Sede intensa"}'::jsonb),
('sleep.headache', 'sleep', '{"es": "Dolor de cabeza frontal", "en": "Frontal headache", "pt": "Dor de cabeça frontal"}'::jsonb),
('sleep.scared_wake', 'sleep', '{"es": "Desperté asustado / Falta de aire", "en": "Woke up scared / Shortness of breath", "pt": "Acordei assustado / Falta de ar"}'::jsonb),
('sleep.loud_snoring', 'sleep', '{"es": "Ronquidos fuertes (según pareja)", "en": "Loud snoring (per partner)", "pt": "Ronco alto (segundo parceiro)"}'::jsonb),
('sleep.confirm_time', 'sleep', '{"es": "CONFIRMAR TIEMPO", "en": "CONFIRM TIME", "pt": "CONFIRMAR TEMPO"}'::jsonb),
('sleep.calculated', 'sleep', '{"es": "Calculamos:", "en": "Calculated:", "pt": "Calculamos:"}'::jsonb),
('sleep.save_session', 'sleep', '{"es": "GUARDAR SESIÓN", "en": "SAVE SESSION", "pt": "SALVAR SESSÃO"}'::jsonb),
('sleep.add_note', 'sleep', '{"es": "Añadir Nota", "en": "Add Note", "pt": "Adicionar Nota"}'::jsonb),
('sleep.note_placeholder', 'sleep', '{"es": "Detalles sobre tu descanso...", "en": "Details about your rest...", "pt": "Detalhes sobre seu descanso..."}'::jsonb)
ON CONFLICT (key) DO UPDATE SET translations = EXCLUDED.translations;

-- Translations for Mind (Trataka)
INSERT INTO translations (key, category, translations) VALUES
('mind.title', 'mind', '{"es": "Poder de la Mente", "en": "Mind Power", "pt": "Poder da Mente"}'::jsonb),
('mind.subtitle', 'mind', '{"es": "Meditación Trataka", "en": "Trataka Meditation", "pt": "Meditação Trataka"}'::jsonb),
('mind.choose_object', 'mind', '{"es": "Elige tu Objeto de Enfoque", "en": "Choose your Focus Object", "pt": "Escolha seu Objeto de Foco"}'::jsonb),
('mind.candle', 'mind', '{"es": "Vela", "en": "Candle", "pt": "Vela"}'::jsonb),
('mind.moon', 'mind', '{"es": "Luna", "en": "Moon", "pt": "Lua"}'::jsonb),
('mind.yantra', 'mind', '{"es": "Yantra", "en": "Yantra", "pt": "Yantra"}'::jsonb),
('mind.dot', 'mind', '{"es": "Punto", "en": "Dot", "pt": "Ponto"}'::jsonb),
('mind.duration', 'mind', '{"es": "Duración", "en": "Duration", "pt": "Duração"}'::jsonb),
('mind.start', 'mind', '{"es": "INICIAR SESIÓN", "en": "START SESSION", "pt": "INICIAR SESSÃO"}'::jsonb),
('mind.focus_instruction', 'mind', '{"es": "Mantén tu mirada en el objeto", "en": "Keep your gaze on the object", "pt": "Mantenha o olhar no objeto"}'::jsonb),
('mind.distraction_log', 'mind', '{"es": "Registrar Distracción", "en": "Log Distraction", "pt": "Registrar Distração"}'::jsonb),
('mind.finish', 'mind', '{"es": "FINALIZAR", "en": "FINISH", "pt": "FINALIZAR"}'::jsonb)
ON CONFLICT (key) DO UPDATE SET translations = EXCLUDED.translations;

-- Translations for Metabolic Lab
INSERT INTO translations (key, category, translations) VALUES
('metabolic.title', 'metabolic', '{"es": "Laboratorio Metabólico", "en": "Metabolic Lab", "pt": "Laboratório Metabólico"}'::jsonb),
('metabolic.subtitle', 'metabolic', '{"es": "Registro de alta precisión", "en": "High precision tracking", "pt": "Registro de alta precisão"}'::jsonb),
('metabolic.tab_nutrition', 'metabolic', '{"es": "Nutrición", "en": "Nutrition", "pt": "Nutrição"}'::jsonb),
('metabolic.tab_fasting', 'metabolic', '{"es": "Estado Ayuno", "en": "Fasting Status", "pt": "Estado Jejum"}'::jsonb),
('metabolic.hydration', 'metabolic', '{"es": "HIDRATACIÓN (Seguro)", "en": "HYDRATION (Safe)", "pt": "HIDRATAÇÃO (Seguro)"}'::jsonb),
('metabolic.supplements', 'metabolic', '{"es": "SUPLEMENTOS", "en": "SUPPLEMENTS", "pt": "SUPLEMENTOS"}'::jsonb),
('metabolic.nutrition_break', 'metabolic', '{"es": "NUTRICIÓN (Rompe Ayuno)", "en": "NUTRITION (Breaks Fast)", "pt": "NUTRIÇÃO (Quebra Jejum)"}'::jsonb),
('metabolic.log_note', 'metabolic', '{"es": "REGISTRAR NOTA / ESTADO", "en": "LOG NOTE / STATUS", "pt": "REGISTRAR NOTA / ESTADO"}'::jsonb),
('metabolic.recent_events', 'metabolic', '{"es": "Últimos Eventos", "en": "Recent Events", "pt": "Eventos Recentes"}'::jsonb)
ON CONFLICT (key) DO UPDATE SET translations = EXCLUDED.translations;

-- Translations for Breathing
INSERT INTO translations (key, category, translations) VALUES
('breathing.title', 'breathing', '{"es": "Respiración Guiada", "en": "Guided Breathing", "pt": "Respiração Guiada"}'::jsonb),
('breathing.subtitle', 'breathing', '{"es": "Coherencia Cardíaca", "en": "Cardiac Coherence", "pt": "Coerência Cardíaca"}'::jsonb),
('breathing.start', 'breathing', '{"es": "INICIAR SESIÓN", "en": "START SESSION", "pt": "INICIAR SESSÃO"}'::jsonb),
('breathing.inhale', 'breathing', '{"es": "INHALAR", "en": "INHALE", "pt": "INALAR"}'::jsonb),
('breathing.exhale', 'breathing', '{"es": "EXHALAR", "en": "EXHALE", "pt": "EXALAR"}'::jsonb),
('breathing.hold', 'breathing', '{"es": "RETENER", "en": "HOLD", "pt": "RETENÇÃO"}'::jsonb),
('breathing.recovery', 'breathing', '{"es": "RECUPERACIÓN", "en": "RECOVERY", "pt": "RECUPERAÇÃO"}'::jsonb),
('breathing.rounds', 'breathing', '{"es": "Rondas", "en": "Rounds", "pt": "Rodadas"}'::jsonb),
('breathing.save_cold', 'breathing', '{"es": "Guardar Sesión", "en": "Save Session", "pt": "Salvar Sessão"}'::jsonb)
ON CONFLICT (key) DO UPDATE SET translations = EXCLUDED.translations;
