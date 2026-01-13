require('dotenv').config();
console.log('Attempting to require app...');
try {
    const app = require('../src/app');
    console.log('App required successfully');
} catch (err) {
    console.error('CRASH LOADING APP:', err);
}
