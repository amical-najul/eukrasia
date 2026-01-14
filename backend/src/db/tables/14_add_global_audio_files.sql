-- Tabla para almacenar archivos de audio globales (Música de fondo, Guía de voz, Sonidos de respiración)
CREATE TABLE IF NOT EXISTS global_audio_files (
    id SERIAL PRIMARY KEY,
    category VARCHAR(50) NOT NULL, -- 'background_music', 'voice_guide', 'breathing_sound_slow', 'breathing_sound_standard', 'breathing_sound_fast'
    file_url TEXT NOT NULL,
    original_name VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_global_audio_category ON global_audio_files(category);
