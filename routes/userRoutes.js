import express from "express";
import {createUser, loginUser, logoutCurrentUser, getAllUsers, upload, assignRole, removeRole} from '../controllers/userController.js'
import { authenticate, authorizeRoles } from "../middlewares/authmiddleware.js";

const router = express.Router()

router.route('/')
  .post(upload.single('profilePicture'), createUser)
  .get(authenticate, authorizeRoles('admin', 'sto', 'patron'), getAllUsers );
router.post("/auth",loginUser);
router.post("/logout", logoutCurrentUser)
router.post('/assign-role', authenticate, authorizeRoles('admin', 'sto', 'patron'), assignRole);
router.post('/remove-role', authenticate, authorizeRoles('admin', 'sto', 'patron'), removeRole);

export default router;