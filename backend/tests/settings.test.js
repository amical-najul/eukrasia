require('dotenv').config();
const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

describe('Settings & Branding', () => {
    let adminToken;
    let userToken;
    const adminEmail = 'test_admin_st_' + Date.now() + '@example.com';
    const userEmail = 'test_user_st_' + Date.now() + '@example.com';

    beforeAll(async () => {
        const secret = process.env.JWT_SECRET || 'fallback_secret';

        // Create Admin
        const hash = await bcrypt.hash('pass', 10);
        const adminRes = await pool.query(
            "INSERT INTO users (email, password_hash, role, is_verified, active, name) VALUES ($1, $2, 'admin', TRUE, TRUE, 'Admin Test') RETURNING *",
            [adminEmail, hash]
        );
        adminToken = jwt.sign({ id: adminRes.rows[0].id, role: 'admin' }, secret);

        // Create User
        const userRes = await pool.query(
            "INSERT INTO users (email, password_hash, role, is_verified, active, name) VALUES ($1, $2, 'user', TRUE, TRUE, 'User Test') RETURNING *",
            [userEmail, hash]
        );
        userToken = jwt.sign({ id: userRes.rows[0].id, role: 'user' }, secret);
    });

    afterAll(async () => {
        await pool.query('DELETE FROM users WHERE email IN ($1, $2)', [adminEmail, userEmail]);
        await pool.end();
    });

    it('should allow Admin to fetch SMTP/Branding settings', async () => {
        const res = await request(app)
            .get('/api/settings/smtp')
            .set('x-auth-token', adminToken);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('app_name');
    });

    it('should DENY User from fetching SMTP/Branding settings', async () => {
        const res = await request(app)
            .get('/api/settings/smtp')
            .set('x-auth-token', userToken);

        expect(res.statusCode).toEqual(403); // Forbidden
    });

    it('should allow anyone to fetch Public settings', async () => {
        const res = await request(app)
            .get('/api/settings/public');

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('app_name');
        expect(res.body).not.toHaveProperty('smtp_pass'); // Ensure secrets are not leaking
    });
});
