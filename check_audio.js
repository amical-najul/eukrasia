const pool = require('./backend/src/config/db');

pool.query('SELECT category, file_url, original_name FROM global_audio_files WHERE is_active = true')
    .then(res => {
        res.rows.forEach(row => {
            console.log(`CAT:${row.category} URL:${row.file_url}`);
        });
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });

