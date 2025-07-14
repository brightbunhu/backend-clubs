import User from '../models/userModel.js';
import asyncHandler from '../middlewares/asyncHandler.js';
import bcrypt from 'bcryptjs';
import createToken from '../utils/createToken.js';
import multer from 'multer';
import path from 'path';

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/profile_pictures/');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.fieldname}${ext}`);
  },
});
const upload = multer({ storage });

const createUser = asyncHandler(async (req, res) => {
  const { regNumber, email, name, surname, dateOfBirth, password } = req.body;
  let profilePicture = req.file ? req.file.path : undefined;

  if (!regNumber || !email || !name || !surname || !dateOfBirth || !password) {
    throw new Error("Please fill all the inputs.");
  }

  const userExists = await User.findOne({ $or: [{ email }, { regNumber }] });
  if (userExists) {
    res.status(400).send("User already exists");
    return;
  }

  // Assign role based on regNumber
  let roles = [];
  if (regNumber.startsWith('R')) {
    roles.push('student');
  } else if (regNumber.startsWith('S')) {
    roles.push('staff');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = new User({
    regNumber,
    email,
    name,
    surname,
    dateOfBirth,
    password: hashedPassword,
    roles,
    profilePicture,
  });

  try {
    await newUser.save();
    createToken(res, newUser._id);
    res.status(201).json({
      _id: newUser._id,
      regNumber: newUser.regNumber,
      email: newUser.email,
      name: newUser.name,
      surname: newUser.surname,
      dateOfBirth: newUser.dateOfBirth,
      roles: newUser.roles,
      profilePicture: newUser.profilePicture,
    });
  } catch (error) {
    res.status(400);
    throw new Error('Invalid user data');
  }
});


const loginUser= asyncHandler(async (req, res) =>{
  const {email,password}= req.body

  const existingUser = await User.findOne({email})

  if (existingUser){
    const isPasswordValid = await bcrypt.compare(password, existingUser.password)
    if(isPasswordValid){
      createToken(res,existingUser._id)
      res.status(201).json({
      _id: existingUser._id,
      username: existingUser.username,
      email: existingUser.email,
      isAdmin: existingUser.isAdmin,
    });
    return
    }
  }
})

const logoutCurrentUser= asyncHandler(async (req, res) =>{
  res.cookie('jwt', '',{
  httponly:true,
  expires: new Date(0),
  })

  res.status(200).json({message:"logout succesfully"}) 
})

const getAllUsers = asyncHandler(async(req, res)=>{
  const users = await User.find({})
  res.json(users)
})

const filterUser = (user) => {
  const { password, ...rest } = user.toObject();
  return rest;
};

// Role management logic
const assignRole = asyncHandler(async (req, res) => {
  const { userId, role } = req.body;
  const actingUser = req.user;

  if (actingUser._id.toString() === userId) {
    return res.status(403).json({ message: 'You cannot assign roles to yourself.' });
  }

  // Permission checks
  if (role === 'sto') {
    if (!actingUser.roles.includes('admin')) {
      return res.status(403).json({ message: 'Only admin can assign sto role.' });
    }
  } else if (role === 'club_leader' || role === 'patron') {
    if (actingUser.roles.includes('sto')) {
      // sto cannot assign sto, admin, or patron (to patron)
      if (role === 'sto' || role === 'admin') {
        return res.status(403).json({ message: 'sto cannot assign sto or admin roles.' });
      }
    } else if (actingUser.roles.includes('patron')) {
      // patron can only assign club_leader
      if (role !== 'club_leader') {
        return res.status(403).json({ message: 'patron can only assign club_leader role.' });
      }
    } else {
      return res.status(403).json({ message: 'Unauthorized role assignment.' });
    }
  } else {
    return res.status(403).json({ message: 'Invalid or unauthorized role assignment.' });
  }

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: 'User not found.' });
  if (user.roles.includes(role)) {
    return res.status(400).json({ message: `User already has role ${role}.` });
  }
  user.roles.push(role);
  await user.save();
  res.json({ message: `Role ${role} assigned.`, user: filterUser(user) });
});

const removeRole = asyncHandler(async (req, res) => {
  const { userId, role } = req.body;
  const actingUser = req.user;

  if (actingUser._id.toString() === userId) {
    return res.status(403).json({ message: 'You cannot remove roles from yourself.' });
  }

  // Permission checks
  if (role === 'sto') {
    if (!actingUser.roles.includes('admin')) {
      return res.status(403).json({ message: 'Only admin can remove sto role.' });
    }
  } else if (role === 'club_leader' || role === 'patron') {
    if (actingUser.roles.includes('sto')) {
      if (role === 'sto' || role === 'admin') {
        return res.status(403).json({ message: 'sto cannot remove sto or admin roles.' });
      }
    } else if (actingUser.roles.includes('patron')) {
      if (role !== 'club_leader') {
        return res.status(403).json({ message: 'patron can only remove club_leader role.' });
      }
    } else {
      return res.status(403).json({ message: 'Unauthorized role removal.' });
    }
  } else {
    return res.status(403).json({ message: 'Invalid or unauthorized role removal.' });
  }

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: 'User not found.' });
  if (!user.roles.includes(role)) {
    return res.status(400).json({ message: `User does not have role ${role}.` });
  }
  user.roles = user.roles.filter(r => r !== role);
  await user.save();
  res.json({ message: `Role ${role} removed.`, user: filterUser(user) });
});

export { createUser, loginUser, logoutCurrentUser, getAllUsers, upload, assignRole, removeRole };

