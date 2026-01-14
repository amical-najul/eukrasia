-- Ensure admin user exists and has correct role
UPDATE users SET role = 'admin' WHERE email = 'jock.alcantara@gmail.com';
SELECT email, role FROM users WHERE email = 'jock.alcantara@gmail.com';
