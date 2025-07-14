import jwt from 'jsonwebtoken'
import User from '../models/userModel.js';
import asyncHandler from './asyncHandler.js';

const authenticate = asyncHandler(async (req, res, next) =>{
    let token;

    token = req.cookies?.jwt;

    if (token){
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.userId).select("-password");
            next();
        } catch (error) {
            res.status(401)
            throw new Error("Not authorized, token failed.")
        }
    }
    else{
        res.status(401)
        throw new Error("Not authorized, no token. ")
    }
});

// Flexible role-based authorization middleware
const authorizeRoles = (...roles) => (req, res, next) => {
    if (!req.user || !req.user.roles || !roles.some(role => req.user.roles.includes(role))) {
        return res.status(403).json({ message: 'Forbidden: insufficient role' });
    }
    next();
};

export {authenticate, authorizeRoles};