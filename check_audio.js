const pool = require('./src/config/db');

pool.query('SELECT category, file_url, original_name, is_active FROM global_audio_files WHERE is_active = true ORDER BY created_at DESC')
    .then(res => {
        console.log('=== ACTIVE AUDIO FILES ===');
        res.rows.forEach(row => {
            console.log(`Category: ${row.category}`);
            console.log(`URL: ${row.file_url}`);
            console.log(`File: ${row.original_name}`);
            console.log('---');
        });
        process.exit(0);
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
