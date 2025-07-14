import express from 'express';
import {
  uploadPoster,
  createEvent,
  approveEvent,
  rejectEvent,
  listEvents,
  getEvent
} from '../controllers/eventController.js';
import { authenticate, authorizeRoles } from '../middlewares/authmiddleware.js';

const router = express.Router();

router.post('/', authenticate, authorizeRoles('club_leader'), uploadPoster.single('poster'), createEvent);
router.patch('/:id/approve', authenticate, authorizeRoles('sto', 'patron'), approveEvent);
router.patch('/:id/reject', authenticate, authorizeRoles('sto', 'patron'), rejectEvent);
router.get('/', authenticate, listEvents);
router.get('/:id', authenticate, getEvent);

export default router; 