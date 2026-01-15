const pool = require('./backend/src/config/db');
const fs = require('fs');

pool.query('SELECT category, file_url FROM global_audio_files WHERE is_active = true')
    .then(res => {
        fs.writeFileSync('audio_data.json', JSON.stringify(res.rows, null, 2));
        console.log('Audio data exported to audio_data.json');
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
