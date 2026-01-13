require('dotenv').config();
console.log('Loading userController...');
try {
    const uc = require('../src/controllers/userController');
    console.log('userController loaded successfully');
} catch (err) {
    console.error('FAIL userController:', err);
}
