import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    regNumber: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    surname: {
        type: String,
        required: true,
    },
    dateOfBirth: {
        type: Date,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    roles: {
        type: [String],
        enum: ['student', 'staff', 'admin', 'sto', 'patron', 'club_leader'],
        default: [],
    },
    profilePicture: {
        type: String,
    },
},
{ timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;