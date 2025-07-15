import express from 'express';
const router = express.Router();
import { createClub, getClubs, getClubById, updateClub, deleteClub, joinClub, getClubLeaders, getClubMembers } from '../controllers/clubController.js';
import { protect, requireRoles } from '../middlewares/authmiddleware.js';
import asyncHandler from '../middlewares/asyncHandler.js';
import upload from '../middlewares/upload.js';

// Public: get all clubs, get club by id
router.get('/', asyncHandler(getClubs));
router.get('/:id', asyncHandler(getClubById));

// Protected: create, update, delete
router.post('/', protect, requireRoles('admin', 'sto'), upload.single('profilePic'), asyncHandler(createClub));
router.put('/:id', protect, requireRoles('admin', 'sto', 'patron', 'club_leader'), upload.single('profilePic'), asyncHandler(updateClub));
router.delete('/:id', protect, asyncHandler(deleteClub));

// Join club (protected)
router.post('/:id/join', protect, asyncHandler(joinClub));
// Get club leaders (public)
router.get('/:id/leaders', asyncHandler(getClubLeaders));
// Get club members (protected)
router.get('/:id/members', protect, asyncHandler(getClubMembers));

export default router; 