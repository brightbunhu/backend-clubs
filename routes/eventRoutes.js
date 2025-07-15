import express from 'express';
const router = express.Router();
import {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  approveEvent,
  rejectEvent,
  likeEvent,
  unlikeEvent,
  svpEvent,
  getSVPList,
} from '../controllers/eventController.js';
import { protect } from '../middlewares/authmiddleware.js';
import asyncHandler from '../middlewares/asyncHandler.js';

// Public: get events, get event by id
router.get('/', asyncHandler(getEvents));
router.get('/:id', asyncHandler(getEventById));

// Protected: create, update, delete
router.post('/', protect, asyncHandler(createEvent));
router.put('/:id', protect, asyncHandler(updateEvent));
router.delete('/:id', protect, asyncHandler(deleteEvent));

// Approve/reject
router.post('/:id/approve', protect, asyncHandler(approveEvent));
router.post('/:id/reject', protect, asyncHandler(rejectEvent));

// Like/unlike
router.post('/:id/like', protect, asyncHandler(likeEvent));
router.post('/:id/unlike', protect, asyncHandler(unlikeEvent));

// SVP
router.post('/:id/svp', protect, asyncHandler(svpEvent));
router.get('/:id/svp', protect, asyncHandler(getSVPList));

export default router; 