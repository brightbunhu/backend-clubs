import User from '../models/userModel.js';
import createToken from '../utils/createToken.js';
import bcrypt from 'bcrypt';

// Register user
const registerUser = async (req, res) => {
  try {
    const { regNumber, email, name, surname, dob, password } = req.body;
    if (!regNumber || !email || !name || !surname || !dob || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const existing = await User.findOne({ $or: [{ regNumber }, { email }] });
    if (existing) {
      return res.status(400).json({ message: 'User already exists' });
    }
    let roles = [];
    if (regNumber.startsWith('R')) roles.push('student');
    if (regNumber.startsWith('S')) roles.push('staff');
    const profilePicture = req.file ? req.file.path : undefined;
    const user = await User.create({
      regNumber,
      email,
      name,
      surname,
      dob,
      password,
      roles,
      profilePicture,
    });
    const token = createToken(user);
    const { password: _, ...userData } = user.toObject();
    res.status(201).json({ user: userData, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login user
const loginUser = async (req, res) => {
  try {
    const { regNumber, password } = req.body;
    if (!regNumber || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    // Allow login with either regNumber or email
    const user = await User.findOne({ $or: [{ regNumber }, { email: regNumber }] });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = createToken(user);
    const { password: _, ...userData } = user.toObject();
    res.json({ user: userData, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Role management helpers
const canPromote = (currentRoles, targetRole) => {
  if (targetRole === 'sto') return currentRoles.includes('admin');
  if (targetRole === 'patron' || targetRole === 'club_leader') return currentRoles.includes('sto') || currentRoles.includes('patron');
  return false;
};
const canDemote = canPromote;

// Promote user to a role
const promoteUser = async (req, res) => {
  const { userId, role } = req.body;
  if (!userId || !role) return res.status(400).json({ message: 'userId and role required' });
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (!canPromote(req.user.roles, role)) return res.status(403).json({ message: 'Forbidden' });
  if (!user.roles.includes(role)) {
    user.roles.push(role);
    await user.save();
  }
  res.json({ message: `User promoted to ${role}` });
};

// Demote user from a role
const demoteUser = async (req, res) => {
  const { userId, role } = req.body;
  if (!userId || !role) return res.status(400).json({ message: 'userId and role required' });
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (!canDemote(req.user.roles, role)) return res.status(403).json({ message: 'Forbidden' });
  if (user.roles.includes(role)) {
    user.roles = user.roles.filter(r => r !== role);
    await user.save();
  }
  res.json({ message: `User demoted from ${role}` });
};

const logoutUser = async (req, res) => {
  // If using cookies for auth, clear the cookie. If using JWT in localStorage, just send a success message.
  res.clearCookie('token'); // This will only work if you set a cookie named 'token'. If not, just send a message.
  res.json({ message: 'Logged out successfully' });
};

export {
  registerUser,
  loginUser,
  promoteUser,
  demoteUser,
  logoutUser,
};

