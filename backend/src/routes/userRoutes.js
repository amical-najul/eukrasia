const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');
const multer = require('multer');

// Multer config for memory storage (buffer for MinIO)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Profile Routes (Authenticated User) - MUST be before /:id routes
router.put('/profile/me', auth, userController.updateProfile);
router.post('/avatar', auth, upload.single('avatar'), userController.uploadAvatar);
router.delete('/avatar', auth, userController.deleteAvatar);
router.delete('/me', auth, userController.deleteOwnAccount);

// Email Change Routes
router.post('/change-email', auth, userController.requestEmailChange);
router.post('/verify-email-change', userController.verifyEmailChange);

// Security Routes
router.put('/change-password', auth, userController.changePassword);

// Admin Routes - MUST be after specific routes to avoid /:id matching /me, /avatar, etc.
router.get('/', auth, admin, userController.getAllUsers);
router.post('/', auth, admin, userController.createUser);
router.put('/:id', auth, admin, userController.updateUser);
router.delete('/:id', auth, admin, userController.deleteUser);

module.exports = router;
