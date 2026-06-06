const Comment = require('../models/Comment');
const Post = require('../models/Post');
const Notification = require('../models/Notification');

// Add comment to a post
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.postId;

    if (!text) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const newComment = new Comment({
      post: postId,
      user: req.user.id,
      text
    });

    await newComment.save();

    // Create notification (if commenting on someone else's post)
    if (post.author.toString() !== req.user.id) {
      const notification = new Notification({
        recipient: post.author,
        sender: req.user.id,
        type: 'comment',
        post: postId
      });
      await notification.save();
    }

    // Populate user info before returning
    const populatedComment = await Comment.findById(newComment._id).populate('user', 'username fullName profilePhoto');

    res.status(201).json(populatedComment);
  } catch (error) {
    res.status(500).json({ message: 'Server error adding comment: ' + error.message });
  }
};

// Get all comments for a post
exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate('user', 'username fullName profilePhoto')
      .sort({ createdAt: 1 });
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching comments: ' + error.message });
  }
};

// Update a comment
exports.updateComment = async (req, res) => {
  try {
    const { text } = req.body;
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to edit this comment' });
    }

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    comment.text = text;
    comment.isEdited = true;
    comment.updatedAt = new Date();

    await comment.save();

    const populatedComment = await Comment.findById(comment._id).populate('user', 'username fullName profilePhoto');

    res.status(200).json(populatedComment);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating comment: ' + error.message });
  }
};

// Delete a comment
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Only comment author can delete
    if (comment.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    await Comment.deleteOne({ _id: req.params.id });

    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting comment: ' + error.message });
  }
};
