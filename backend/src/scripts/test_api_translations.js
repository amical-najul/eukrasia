const http = require('http');

const testApi = () => {
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/translations/pt',
        method: 'GET'
    };

    const req = http.request(options, res => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            try {
                const json = JSON.parse(data);
                console.log('Language:', json.language);
                console.log('Dashboard Welcome:', json.translations['dashboard.welcome_user']);
                console.log('Settings Title:', json.translations['settings.title']);
            } catch (e) {
                console.error('Error parsing JSON:', e);
                console.log('Raw:', data);
            }
        });
    });

    req.on('error', error => {
        console.error('Error:', error);
    });

    req.end();
};

testApi();
