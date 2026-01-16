require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

async function verify() {
    try {
        console.log("Connecting to DB at", process.env.DB_HOST);

        // 1. Get User ID
        const userRes = await pool.query("SELECT id FROM users WHERE email = 'ana@gmail.com'");
        if (userRes.rows.length === 0) {
            console.error("User ana@gmail.com not found!");
            process.exit(1);
        }
        const userId = userRes.rows[0].id;
        console.log("Found User ID:", userId);

        // 2. Check Weight Log
        const weightRes = await pool.query("SELECT * FROM body_weight_logs WHERE user_id = $1 ORDER BY recorded_at DESC LIMIT 1", [userId]);
        console.log("\n--- Latest Weight Log ---");
        if (weightRes.rows.length > 0) {
            const w = weightRes.rows[0];
            console.log("Weight Row:", JSON.stringify(w));

            // Check approximate equality
            if (Math.abs(parseFloat(w.weight) - 75.50) < 0.1) {
                console.log("✅ Weight verification PASSED: " + w.weight + " kg found.");
            } else {
                console.warn("⚠️ Weight verification MISMATCH. Expected 75.5, got " + w.weight);
            }
        } else {
            console.log("No weight logs found.");
        }

        // 3. Check Body Measurements (Height, Waist)
        const measureRes = await pool.query("SELECT * FROM body_measurements WHERE user_id = $1 ORDER BY recorded_at DESC LIMIT 5", [userId]);
        console.log("\n--- Latest Measurements ---");
        if (measureRes.rows.length > 0) {
            console.log("Measurements:", JSON.stringify(measureRes.rows));
            const height = measureRes.rows.find(m => m.measurement_type === 'HEIGHT');
            if (height && Math.abs(parseFloat(height.value) - 178) < 1) {
                console.log("✅ Height verification PASSED: " + height.value + " cm found.");
            }
        } else {
            console.log("No measurements found.");
        }

    } catch (err) {
        console.error("Verification Error:", err);
    } finally {
        await pool.end();
    }
}

verify();
