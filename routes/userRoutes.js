import express from 'express';
const router = express.Router();
import { registerUser, loginUser, promoteUser, demoteUser, logoutUser } from '../controllers/userController.js';
import upload from '../middlewares/upload.js';
import asyncHandler from '../middlewares/asyncHandler.js';
import { protect } from '../middlewares/authmiddleware.js';

// Register route (with profile picture upload)
router.post('/register', upload.single('profilePicture'), asyncHandler(registerUser));

// Login route
router.post('/login', asyncHandler(loginUser));

// Logout route
router.post('/logout', asyncHandler(logoutUser));

// Role management
router.post('/promote', protect, asyncHandler(promoteUser));
router.post('/demote', protect, asyncHandler(demoteUser));

export default router;