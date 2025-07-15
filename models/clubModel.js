import mongoose from 'mongoose';

const clubSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  introducedAt: { type: Date, required: true },
  profilePic: { type: String }, // optional, stores file path or URL
  patron: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  clubLeaders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

export default mongoose.model('Club', clubSchema); 