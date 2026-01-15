# Database Architecture - Eukrasia

## Overview

Eukrasia uses **PostgreSQL** as its primary database with the following major modules:

| Module | Tables | Purpose |
|--------|--------|---------|
| **Auth** | `users`, `password_reset_tokens`, `email_change_tokens`, `password_history`, `avatar_history` | User authentication and management |
| **Settings** | `app_settings`, `advanced_settings`, `email_templates`, `translations` | Application configuration |
| **Metabolic** | `metabolic_logs` | Food, hydration, supplements, fasting tracking |
| **Breathing** | `breathing_exercises`, `breathing_configurations`, `global_audio_files` | Guided breathing sessions |
| **Mind** | `mind_sessions`, `mind_configurations` | Trataka focus meditation |
| **Sleep** | `sleep_sessions` | Sleep tracking and apnea detection |
| **AI** | `ai_limits`, `ai_usage_logs` | AI usage quotas and tracking |

---

## Schema Details

### Core Tables

#### `users`
Primary user table with authentication data.

| Column | Type | Notes |
|--------|------|-------|
| `id` | SERIAL | Primary key |
| `email` | VARCHAR(255) | Unique, required |
| `password_hash` | VARCHAR(255) | Bcrypt hash |
| `role` | VARCHAR(50) | `'user'` or `'admin'` |
| `language_preference` | VARCHAR(10) | `'es'`, `'en'`, `'pt'` |
| `avatar_url` | TEXT | MinIO URL |
| `is_verified` | BOOLEAN | Email verification status |

---

### Metabolic Module

#### `metabolic_logs`
Unified event log for all metabolic tracking.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key |
| `user_id` | INTEGER | FK to users |
| `event_type` | ENUM | `'CONSUMO'`, `'INICIO_AYUNO'`, `'SINTOMA'`, `'NOTA'` |
| `category` | VARCHAR(50) | `'HIDRATACION'`, `'SUPLEMENTO_AM'`, `'COMIDA_REAL'`, `'ESTADO'` |
| `item_name` | VARCHAR(100) | Display name of item |
| `is_fasting_breaker` | BOOLEAN | Resets fasting timer if TRUE |
| `image_url` | TEXT | Optional MinIO URL |
| `notes` | TEXT | User notes for AI analysis |
| `created_at` | TIMESTAMPTZ | Event timestamp |

---

### Breathing Module

#### `breathing_exercises`
Session history for breathing exercises.

| Column | Type | Notes |
|--------|------|-------|
| `id` | SERIAL | Primary key |
| `user_id` | INTEGER | FK to users |
| `type` | VARCHAR(50) | `'guided'` or `'retention'` |
| `duration_seconds` | INTEGER | Total session duration |
| `rounds_data` | JSONB | Array of round results |
| `notes` | TEXT | Session notes |

#### `breathing_configurations`
Per-user breathing preferences.

| Column | Type | Default |
|--------|------|---------|
| `rounds` | INTEGER | 3 |
| `breaths_per_round` | INTEGER | 30 |
| `speed` | VARCHAR(20) | `'standard'` |
| `bg_music` | BOOLEAN | TRUE |
| `phase_music` | BOOLEAN | TRUE |
| `retention_music` | BOOLEAN | TRUE |
| `voice_guide` | BOOLEAN | TRUE |
| `breathing_guide` | BOOLEAN | TRUE |
| `retention_guide` | BOOLEAN | TRUE |
| `ping_gong` | BOOLEAN | TRUE |
| `breath_sounds` | BOOLEAN | TRUE |
| `inhale_prompt` | BOOLEAN | TRUE |
| `exhale_prompt` | BOOLEAN | TRUE |

---

### Sleep Module

#### `sleep_sessions`
Sleep tracking with apnea symptom detection.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key |
| `start_time` | TIMESTAMPTZ | When user started sleeping |
| `end_time` | TIMESTAMPTZ | When user woke up |
| `duration_minutes` | INTEGER | Calculated or manual |
| `quality_score` | INTEGER | 1-5 stars |
| `symptoms` | TEXT[] | Array of symptom IDs |
| `apnea_flag` | BOOLEAN | Calculated from symptoms |
| `notes` | TEXT | Morning check-in notes |

---

### Mind Module (Trataka Focus)

#### `mind_sessions`
Meditation session history.

| Column | Type | Notes |
|--------|------|-------|
| `focus_object` | VARCHAR(20) | `'candle'`, `'moon'`, `'yantra'`, `'dot'` |
| `target_duration_sec` | INTEGER | Configured duration |
| `actual_duration_sec` | INTEGER | Actual practice time |
| `distraction_count` | INTEGER | User-reported distractions |
| `status` | VARCHAR(20) | `'completed'` or `'partial'` |

---

## Migration History

| File | Description |
|------|-------------|
| `001_initial_user_columns.sql` | Base user structure |
| `002_add_notes_to_breathing.sql` | Notes field for sessions |
| `003_metabolic_logs.sql` | Unified metabolic tracking |
| `004_sleep_sessions.sql` | Sleep tracking table |
| `005_database_consistency_fixes.sql` | ENUM fix, timezone standardization, missing columns |

---

## Indexing Strategy

All tables include optimized indexes for common query patterns:

- **User-based lookups:** `idx_*_user_id` on `user_id` column
- **Date sorting:** `idx_*_date` on `created_at DESC`
- **Fasting calculation:** Partial index on `is_fasting_breaker = TRUE`
- **Active sessions:** Partial index on `end_time IS NULL`

---

## Data Types Conventions

| Convention | Usage |
|------------|-------|
| `SERIAL` | Auto-increment integer IDs for simple tables |
| `UUID` | Complex tables with potential distributed systems |
| `TIMESTAMPTZ` | All timestamps (with timezone) |
| `JSONB` | Structured data that varies (rounds, translations) |
| `TEXT[]` | PostgreSQL arrays for lists |
| `BOOLEAN` | Feature toggles, flags |
