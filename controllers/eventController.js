import Event from '../models/Event.js';
import asyncHandler from '../middlewares/asyncHandler.js';
import multer from 'multer';
import path from 'path';

const posterStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/event_posters/');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.fieldname}${ext}`);
  },
});
const uploadPoster = multer({ storage: posterStorage });


const createEvent = asyncHandler(async (req, res) => {
  const { title, description, date, club } = req.body;
  const poster = req.file ? req.file.path : undefined;
  const user = req.user;

  if (!user.roles.includes('club_leader')) {
    return res.status(403).json({ message: 'Only club_leader can create events.' });
  }

  if (!title || !description || !date || !club) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  const event = new Event({
    title,
    description,
    date,
    club,
    poster,
    status: 'pending',
    createdBy: user._id,
  });
  await event.save();
  res.status(201).json(event);
});

const approveEvent = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user.roles.includes('sto') && !user.roles.includes('patron')) {
    return res.status(403).json({ message: 'Only sto or patron can approve events.' });
  }
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found.' });
  event.status = 'approved';
  await event.save();
  res.json({ message: 'Event approved.', event });
});

const rejectEvent = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user.roles.includes('sto') && !user.roles.includes('patron')) {
    return res.status(403).json({ message: 'Only sto or patron can reject events.' });
  }
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found.' });
  event.status = 'rejected';
  await event.save();
  res.json({ message: 'Event rejected.', event });
});

const listEvents = asyncHandler(async (req, res) => {
  const user = req.user;
  let filter = {};
  if (user.roles.includes('student') || user.roles.includes('staff')) {
    filter.status = 'approved';
  }
  const events = await Event.find(filter);
  res.json(events);
});


const getEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found.' });
  res.json(event);
});

export { uploadPoster, createEvent, approveEvent, rejectEvent, listEvents, getEvent }; 