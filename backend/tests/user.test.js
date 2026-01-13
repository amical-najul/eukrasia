require('dotenv').config();
const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

describe('Admin User Management', () => {
    let adminToken;
    let userIdToDelete;

    const adminEmail = 'test_admin_mgmt_' + Date.now() + '@example.com';
    const userEmail = 'test_user_target_' + Date.now() + '@example.com';

    beforeAll(async () => {
        // Create Admin
        const hash = await bcrypt.hash('admin123', 10);
        const adminRes = await pool.query(
            "INSERT INTO users (email, password_hash, role, is_verified, active, name, status) VALUES ($1, $2, 'admin', TRUE, TRUE, 'Admin', 'active') RETURNING *",
            [adminEmail, hash]
        );
        const adminUser = adminRes.rows[0];

        // Ensure JWT_SECRET is available (loaded in index.js/server.js, but here in tests we might need to mock or ensure load)
        // Since app.js doesn't load secret from DB (server.js does), we might rely on .env or default for tests.
        // Assuming test .env is set or defaults work.
        const secret = process.env.JWT_SECRET || 'fallback_secret';

        adminToken = jwt.sign(
            { id: adminUser.id, email: adminUser.email, role: adminUser.role },
            secret,
            { expiresIn: '1h' }
        );

        // Create Regular User to Manage
        const userRes = await pool.query(
            "INSERT INTO users (email, password_hash, role, is_verified, active, name, status) VALUES ($1, $2, 'user', TRUE, TRUE, 'Target', 'active') RETURNING id",
            [userEmail, hash]
        );
        userIdToDelete = userRes.rows[0].id;
    });

    afterAll(async () => {
        await pool.query('DELETE FROM users WHERE email IN ($1, $2)', [adminEmail, userEmail]);
        await pool.end();
    });

    it('should list users (paginated)', async () => {
        const res = await request(app)
            .get('/api/users')
            .set('x-auth-token', adminToken);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('users');
        expect(Array.isArray(res.body.users)).toBe(true);
    });

    it('should update user status to inactive', async () => {
        const res = await request(app)
            .put(`/api/users/${userIdToDelete}`)
            .set('x-auth-token', adminToken)
            .send({
                role: 'user',
                status: 'inactive' // Testing status update
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.user.status).toBe('inactive');
        expect(res.body.user.active).toBe(false); // Legacy sync check
    });

    it('should soft delete user', async () => {
        const res = await request(app)
            .delete(`/api/users/${userIdToDelete}`)
            .set('x-auth-token', adminToken);

        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toContain('eliminado');

        // Verify in DB
        const check = await pool.query('SELECT status, active FROM users WHERE id = $1', [userIdToDelete]);
        expect(check.rows[0].status).toBe('deleted');
        expect(check.rows[0].active).toBe(false);
    });
});
