import Comment from '../models/commentModel.js';
import Event from '../models/eventModel.js';

// Add comment to event (all users)
const addComment = async (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ message: 'Content required' });
  const event = await Event.findById(req.params.eventId);
  if (!event) return res.status(404).json({ message: 'Event not found' });
  const comment = await Comment.create({
    eventId: event._id,
    userId: req.user._id,
    content,
  });
  event.comments.push(comment._id);
  await event.save();
  res.status(201).json(comment);
};

// Delete comment (club_leader, patron, sto)
const deleteComment = async (req, res) => {
  const comment = await Comment.findById(req.params.commentId);
  if (!comment) return res.status(404).json({ message: 'Comment not found' });
  // Only club_leader, patron, sto
  if (!req.user.roles.some(r => ['club_leader', 'patron', 'sto'].includes(r))) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  // Remove from event.comments
  await Event.findByIdAndUpdate(comment.eventId, { $pull: { comments: comment._id } });
  await comment.deleteOne();
  res.json({ message: 'Comment deleted' });
};

// Get comments for event (all users)
const getCommentsForEvent = async (req, res) => {
  const comments = await Comment.find({ eventId: req.params.eventId })
    .populate('userId', 'name surname regNumber roles')
    .sort({ timestamp: -1 });
  res.json(comments);
};

export { addComment, deleteComment, getCommentsForEvent }; 