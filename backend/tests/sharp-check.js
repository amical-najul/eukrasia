console.log('Loading sharp...');
try {
    const sharp = require('sharp');
    console.log('Sharp loaded successfully');
} catch (err) {
    console.error('FAIL sharp:', err.message);
}
