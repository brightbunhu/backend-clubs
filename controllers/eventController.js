import Event from '../models/eventModel.js';
import Club from '../models/clubModel.js';

// Create event (club_leader, patron, sto)
const createEvent = async (req, res) => {
  const { title, description, date, club } = req.body;
  if (!title || !description || !date || !club) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  if (!req.user.roles.some(r => ['club_leader', 'patron', 'sto'].includes(r))) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  const event = await Event.create({
    title,
    description,
    date,
    club,
    createdBy: req.user._id,
    status: 'pending',
  });
  res.status(201).json(event);
};

// Get events (role-based visibility)
const getEvents = async (req, res) => {
  let filter = {};
  if (!req.user || req.user.roles.some(r => ['student', 'staff'].includes(r))) {
    filter.status = 'approved';
  }
  // Optionally filter by club
  if (req.query.club) filter.club = req.query.club;
  const events = await Event.find(filter)
    .populate('club', 'name')
    .populate('createdBy', 'name surname regNumber roles')
    .sort({ date: -1 });
  res.json(events);
};

// Get event by id
const getEventById = async (req, res) => {
  const event = await Event.findById(req.params.id)
    .populate('club', 'name')
    .populate('createdBy', 'name surname regNumber roles')
    .populate('likes', 'name surname regNumber')
    .populate('svpList', 'name surname regNumber');
  if (!event) return res.status(404).json({ message: 'Event not found' });
  // Only show if approved for students/staff
  if (
    (!req.user || req.user.roles.some(r => ['student', 'staff'].includes(r))) &&
    event.status !== 'approved'
  ) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  res.json(event);
};

// Update event (club_leader, patron, sto)
const updateEvent = async (req, res) => {
  if (!req.user.roles.some(r => ['club_leader', 'patron', 'sto'].includes(r))) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!event) return res.status(404).json({ message: 'Event not found' });
  res.json(event);
};

// Delete event (club_leader, patron, sto)
const deleteEvent = async (req, res) => {
  if (!req.user.roles.some(r => ['club_leader', 'patron', 'sto'].includes(r))) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  const event = await Event.findByIdAndDelete(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found' });
  res.json({ message: 'Event deleted' });
};

// Approve event (patron, sto)
const approveEvent = async (req, res) => {
  if (!req.user.roles.some(r => ['patron', 'sto'].includes(r))) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  const event = await Event.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });
  if (!event) return res.status(404).json({ message: 'Event not found' });
  res.json(event);
};

// Reject event (patron, sto)
const rejectEvent = async (req, res) => {
  if (!req.user.roles.some(r => ['patron', 'sto'].includes(r))) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  const event = await Event.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true });
  if (!event) return res.status(404).json({ message: 'Event not found' });
  res.json(event);
};

// Like event (all users)
const likeEvent = async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found' });
  if (!event.likes.includes(req.user._id)) {
    event.likes.push(req.user._id);
    await event.save();
  }
  res.json({ message: 'Event liked' });
};

// Unlike event (all users)
const unlikeEvent = async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found' });
  event.likes = event.likes.filter(uid => uid.toString() !== req.user._id.toString());
  await event.save();
  res.json({ message: 'Event unliked' });
};

// SVP (mark attendance)
const svpEvent = async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found' });
  if (!event.svpList.includes(req.user._id)) {
    event.svpList.push(req.user._id);
    await event.save();
  }
  res.json({ message: 'Attendance marked' });
};

// Get SVP list/count (club_leader, patron, sto)
const getSVPList = async (req, res) => {
  const event = await Event.findById(req.params.id).populate('svpList', 'name surname regNumber');
  if (!event) return res.status(404).json({ message: 'Event not found' });
  if (!req.user.roles.some(r => ['club_leader', 'patron', 'sto'].includes(r))) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  res.json({ count: event.svpList.length, svpList: event.svpList });
};

export {
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
}; 