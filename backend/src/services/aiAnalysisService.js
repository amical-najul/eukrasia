const pool = require('../config/db');
const { decrypt } = require('../utils/encryption');
const DataAggregationService = require('./dataAggregationService');

class AiAnalysisService {

    // Fetch LLM config (User specific or Global fallback)
    static async getLlmConfig(userId) {
        // 1. Try User Config
        const userConfig = await pool.query(
            'SELECT provider, model, api_key FROM user_llm_config WHERE user_id = $1 AND is_active = true',
            [userId]
        );

        if (userConfig.rows.length > 0) {
            const { provider, model, api_key } = userConfig.rows[0];
            return {
                provider,
                model,
                apiKey: decrypt(api_key)
            };
        }

        // 2. Try Global Config (if enabled)
        // ... (Skipping global for now as per "Bring Your Own Key" focus, but structure allows it)
        return null;
    }

    static async generateAnalysis(userId, reportType, startDate, endDate) {
        // 1. Get Data
        const healthData = await DataAggregationService.getUserData(userId, startDate, endDate);

        // 2. Get Config
        const config = await this.getLlmConfig(userId);
        if (!config || !config.apiKey) {
            throw new Error('No valid LLM Configuration found for this user.');
        }

        // 3. Prepare Prompt
        const prompt = this.constructPrompt(reportType, healthData);

        // 4. Call LLM
        let analysisContent = '';
        if (config.provider === 'openai' || config.provider === 'deepseek' || config.provider === 'xai') {
            analysisContent = await this.callOpenAICompatible(config, prompt);
        } else if (config.provider === 'anthropic') {
            analysisContent = await this.callAnthropic(config, prompt);
        } else if (config.provider === 'gemini') {
            analysisContent = await this.callGemini(config, prompt);
        } else {
            throw new Error(`Provider ${config.provider} not supported yet.`);
        }

        // 5. Save Report
        const report = await pool.query(
            `INSERT INTO ai_analysis_reports (user_id, report_type, date_range_start, date_range_end, content)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, created_at`,
            [userId, reportType, startDate, endDate, analysisContent]
        );

        // Update last_analysis_at
        await pool.query(
            'UPDATE user_llm_config SET last_analysis_at = NOW() WHERE user_id = $1',
            [userId]
        );

        return {
            id: report.rows[0].id,
            content: analysisContent,
            created_at: report.rows[0].created_at
        };
    }

    static constructPrompt(reportType, data) {
        return `
        Role: Eres un experto Coach de Salud y Analista de Datos para "Eukrasia", una aplicación de salud holística.
        Language: Español.
        Task: Analiza los datos del usuario para el periodo (${reportType}) y proporciona insights accionables.
        
        Data Context:
        ${JSON.stringify(data, null, 2)}
        
        Instructions:
        1. **Resumen Ejecutivo**: Un resumen breve y motivador del progreso general del usuario.
        2. **Análisis por Área (Con Tablas)**:
           - Crea tablas Markdown para resumir métricas clave (ej: Promedio de Sueño, Días de Ayuno, Cambio de Peso, Sesiones de Mente).
           - Analiza Nutrición, Sueño, Cuerpo y Mente.
        3. **Visualización de Tendencias (Mermaid Charts)**:
           - Genera bloques de código \`\`\`mermaid para visualizar tendencias.
           - Si hay datos de **Peso**, crea un gráfico de línea (xychart-beta o graph LR) mostrando la evolución.
           - Si hay datos de **Sueño**, crea un gráfico mostrando Calidad vs Duración.
           - Ejemplo de formato:
             \`\`\`mermaid
             xychart-beta
               title "Evolución de Peso"
               x-axis [Fechas]
               y-axis "Peso (kg)" 60 --> 90
               line [valores]
             \`\`\`
             (Adapta el tipo de gráfico según los datos disponibles).
        4. **Análisis de Síntomas**: Si hay síntomas registrados, búscalos correlaciones con sueño, dieta o estrés.
        5. **Recomendaciones Personalizadas**:
           - Proporciona 3 recomendaciones específicas basadas en la ciencia para la próxima semana.
        
        Tone: Empático, profesional, riguroso pero accesible.
        Format: Markdown estándar de GitHub.
        `;
    }

    static async callOpenAICompatible(config, prompt) {
        try {
            let baseUrl = 'https://api.openai.com/v1/chat/completions';
            let model = config.model || 'gpt-4o';

            if (config.provider === 'deepseek') {
                baseUrl = 'https://api.deepseek.com/chat/completions';
                model = config.model || 'deepseek-chat';
            } else if (config.provider === 'xai') {
                baseUrl = 'https://api.x.ai/v1/chat/completions';
                model = config.model || 'grok-beta';
            }

            const response = await fetch(baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${config.apiKey}`
                },
                body: JSON.stringify({
                    model: model,
                    messages: [
                        { role: 'system', content: 'You are a helpful and insightful health coach.' },
                        { role: 'user', content: prompt }
                    ],
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`${config.provider.toUpperCase()} API Error: ${errorText}`);
            }

            const json = await response.json();
            return json.choices[0].message.content;

        } catch (err) {
            console.error(`${config.provider} call failed:`, err);
            throw new Error(`Failed to generate analysis from ${config.provider}: ${err.message}`);
        }
    }

    static async callAnthropic(config, prompt) {
        try {
            const model = config.model || 'claude-3-5-sonnet-20241022';
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'x-api-key': config.apiKey,
                    'anthropic-version': '2023-06-01',
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    model: model,
                    max_tokens: 4000,
                    system: "You are an expert Health Coach and Data Analyst for Eukrasia.",
                    messages: [
                        { role: 'user', content: prompt }
                    ]
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Anthropic API Error: ${errorText}`);
            }

            const json = await response.json();
            return json.content[0].text;

        } catch (err) {
            console.error('Anthropic call failed:', err);
            throw new Error(`Failed to generate analysis from Anthropic: ${err.message}`);
        }
    }

    static async callGemini(config, prompt) {
        try {
            const model = config.model || 'gemini-1.5-flash';
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.apiKey}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }],
                    systemInstruction: {
                        parts: [{ text: "You are an expert Health Coach and Data Analyst for Eukrasia." }]
                    }
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Gemini API Error: ${errorText}`);
            }

            const json = await response.json();

            if (json.candidates && json.candidates.length > 0 && json.candidates[0].content) {
                return json.candidates[0].content.parts[0].text;
            } else {
                throw new Error('Gemini API returned unexpected structure.');
            }

        } catch (err) {
            console.error('Gemini call failed:', err);
            throw new Error(`Failed to generate analysis from Gemini: ${err.message}`);
        }
    }
}

module.exports = AiAnalysisService;
