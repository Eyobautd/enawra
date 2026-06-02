const Like = require('../models/Like');
const Post = require('../models/Post');
const Notification = require('../models/Notification');

// Toggle like (like / unlike)
exports.toggleLike = async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.user.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const existingLike = await Like.findOne({ post: postId, user: userId });

    let liked = false;
    if (existingLike) {
      // Unlike
      await Like.deleteOne({ _id: existingLike._id });
      liked = false;

      // Delete corresponding notification
      await Notification.deleteOne({
        sender: userId,
        recipient: post.author,
        post: postId,
        type: 'like'
      });
    } else {
      // Like
      const newLike = new Like({ post: postId, user: userId });
      await newLike.save();
      liked = true;

      // Create notification (if liking someone else's post)
      if (post.author.toString() !== userId) {
        const notification = new Notification({
          recipient: post.author,
          sender: userId,
          type: 'like',
          post: postId
        });
        await notification.save();
      }
    }

    const likesCount = await Like.countDocuments({ post: postId });

    res.status(200).json({
      liked,
      likesCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error toggling like: ' + error.message });
  }
};

// Get like status and count for a post
exports.getLikes = async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.user.id;

    const likesCount = await Like.countDocuments({ post: postId });
    const userLike = await Like.findOne({ post: postId, user: userId });

    res.status(200).json({
      liked: !!userLike,
      likesCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching likes: ' + error.message });
  }
};
