const cron = require('node-cron');
const pool = require('../config/db');
const AiAnalysisService = require('../services/aiAnalysisService');

// Run daily at 08:00 AM
const SCHEDULE = '0 8 * * *';

const runAnalysisJob = async () => {
    console.log('🤖 Starting Daily Analysis Job...');
    try {
        // Find users due for analysis
        // 1. Has valid config (active)
        // 2. Frequency matches today's condition
        // 3. Last analysis wasn't today (to avoid double runs)

        const client = await pool.connect();
        try {
            const users = await client.query(
                `SELECT user_id, analysis_frequency, last_analysis_at 
                 FROM user_llm_config 
                 WHERE is_active = true AND analysis_frequency != 'manual_only'`
            );

            const now = new Date();
            const todayDay = now.getDay(); // 0=Sun, 1=Mon...
            const todayDate = now.getDate(); // 1-31

            for (const user of users.rows) {
                const { user_id, analysis_frequency, last_analysis_at } = user;
                let shouldRun = false;
                let rangeStart = new Date();

                // Determine if should run
                if (analysis_frequency === 'daily') {
                    shouldRun = true;
                    rangeStart.setDate(now.getDate() - 1); // Last 24h
                } else if (analysis_frequency === 'weekly' && todayDay === 1) { // Monday
                    shouldRun = true;
                    rangeStart.setDate(now.getDate() - 7); // Last 7 days
                } else if (analysis_frequency === 'monthly' && todayDate === 1) { // 1st of month
                    shouldRun = true;
                    rangeStart.setMonth(now.getMonth() - 1); // Last month
                }

                // Check prevent double run (if already ran today)
                if (last_analysis_at) {
                    const last = new Date(last_analysis_at);
                    if (last.toDateString() === now.toDateString()) {
                        shouldRun = false;
                    }
                }

                if (shouldRun) {
                    console.log(`Analyzing for User ${user_id} (${analysis_frequency})...`);
                    try {
                        await AiAnalysisService.generateAnalysis(user_id, analysis_frequency, rangeStart, now);
                        console.log(`✅ Analysis complete for User ${user_id}`);
                    } catch (err) {
                        console.error(`❌ Failed analysis for User ${user_id}:`, err.message);
                    }
                }
            }

        } finally {
            client.release();
        }

    } catch (err) {
        console.error('Analysis Job Error:', err);
    }
};

const initScheduler = () => {
    // Schedule the task
    cron.schedule(SCHEDULE, runAnalysisJob);
    console.log(`📅 Analysis Scheduler initialized (${SCHEDULE})`);
};

module.exports = { initScheduler, runAnalysisJob };
