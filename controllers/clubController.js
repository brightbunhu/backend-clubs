import Club from '../models/clubModel.js';
import User from '../models/userModel.js';
import path from 'path';

// Create a club
const createClub = async (req, res) => {
  const { name, description, introducedAt, patron, clubLeaders } = req.body;
  // Only admin and SDO
  if (!req.user.roles.some(r => ['admin', 'sto'].includes(r))) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  if (!name || !description || !introducedAt) {
    return res.status(400).json({ message: 'Name, description, and introducedAt are required' });
  }
  let profilePic;
  if (req.file) {
    profilePic = path.join('uploads/profile_pictures/', req.file.filename);
  }
  const club = await Club.create({
    name,
    description,
    introducedAt: new Date(introducedAt),
    profilePic,
    patron,
    clubLeaders
  });
  res.status(201).json(club);
};

// Get all clubs
const getClubs = async (req, res) => {
  const clubs = await Club.find().populate('patron clubLeaders', 'name surname regNumber roles');
  res.json(clubs);
};

// Get club by id
const getClubById = async (req, res) => {
  const club = await Club.findById(req.params.id).populate('patron clubLeaders members', 'name surname regNumber roles');
  if (!club) return res.status(404).json({ message: 'Club not found' });
  res.json(club);
};

// Update club
const updateClub = async (req, res) => {
  // Only admin, SDO, patron, club_leader
  if (!req.user.roles.some(r => ['admin', 'sto', 'patron', 'club_leader'].includes(r))) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  const updateFields = {};
  if (req.body.name) updateFields.name = req.body.name;
  if (req.body.description) updateFields.description = req.body.description;
  if (req.body.introducedAt) updateFields.introducedAt = new Date(req.body.introducedAt);
  if (req.file) {
    updateFields.profilePic = path.join('uploads/profile_pictures/', req.file.filename);
  }
  const club = await Club.findByIdAndUpdate(req.params.id, updateFields, { new: true });
  if (!club) return res.status(404).json({ message: 'Club not found' });
  res.json(club);
};

// Delete club
const deleteClub = async (req, res) => {
  // Only sto, patron, admin
  if (!req.user.roles.some(r => ['sto', 'patron', 'admin'].includes(r))) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  const club = await Club.findByIdAndDelete(req.params.id);
  if (!club) return res.status(404).json({ message: 'Club not found' });
  res.json({ message: 'Club deleted' });
};

// Join a club
const joinClub = async (req, res) => {
  const clubId = req.params.id;
  const userId = req.user._id;
  const club = await Club.findById(clubId);
  if (!club) return res.status(404).json({ message: 'Club not found' });
  // Add user to club members if not already
  if (!club.members.includes(userId)) {
    club.members.push(userId);
    await club.save();
  }
  // Add club to user's clubsJoined if not already
  const user = await User.findById(userId);
  if (!user.clubsJoined.includes(clubId)) {
    user.clubsJoined.push(clubId);
    await user.save();
  }
  res.json({ message: 'Joined club' });
};

// Get club leaders (public)
const getClubLeaders = async (req, res) => {
  const club = await Club.findById(req.params.id).populate('clubLeaders', 'name surname regNumber roles');
  if (!club) return res.status(404).json({ message: 'Club not found' });
  res.json(club.clubLeaders);
};

// Get club members (restricted)
const getClubMembers = async (req, res) => {
  const club = await Club.findById(req.params.id).populate('members', 'name surname regNumber roles');
  if (!club) return res.status(404).json({ message: 'Club not found' });
  // Only club_leader, patron, sto can view
  if (!req.user.roles.some(r => ['club_leader', 'patron', 'sto'].includes(r))) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  res.json(club.members);
};

export {
  createClub,
  getClubs,
  getClubById,
  updateClub,
  deleteClub,
  joinClub,
  getClubLeaders,
  getClubMembers,
}; 