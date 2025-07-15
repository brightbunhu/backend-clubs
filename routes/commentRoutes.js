import express from 'express';
const router = express.Router();
import { addComment, deleteComment, getCommentsForEvent } from '../controllers/commentController.js';
import { protect } from '../middlewares/authmiddleware.js';
import asyncHandler from '../middlewares/asyncHandler.js';

// Add comment to event
router.post('/:eventId', protect, asyncHandler(addComment));
// Delete comment
router.delete('/:commentId', protect, asyncHandler(deleteComment));
// Get comments for event
router.get('/event/:eventId', asyncHandler(getCommentsForEvent));

export default router; 