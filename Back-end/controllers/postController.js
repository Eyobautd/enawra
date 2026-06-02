const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Like = require('../models/Like');

// Create a post
exports.createPost = async (req, res) => {
  try {
    const { text, mediaUrl, mediaType } = req.body;
    if (!text && !mediaUrl) {
      return res.status(400).json({ message: 'Post must have text or media' });
    }

    const newPost = new Post({
      author: req.user.id,
      text,
      mediaUrl: mediaUrl || null,
      mediaType: mediaType || null
    });

    await newPost.save();

    // Populate author info before returning
    const populatedPost = await Post.findById(newPost._id).populate('author', 'username fullName profilePhoto');

    const postObj = {
      ...populatedPost.toObject(),
      likesCount: 0,
      commentsCount: 0,
      liked: false
    };

    res.status(201).json(postObj);
  } catch (error) {
    res.status(500).json({ message: 'Server error creating post: ' + error.message });
  }
};

// Get feed (all posts)
exports.getFeed = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'username fullName profilePhoto')
      .sort({ createdAt: -1 });

    const postsWithStats = await Promise.all(posts.map(async (post) => {
      const likesCount = await Like.countDocuments({ post: post._id });
      const commentsCount = await Comment.countDocuments({ post: post._id });
      const userLike = await Like.findOne({ post: post._id, user: req.user.id });

      return {
        ...post.toObject(),
        likesCount,
        commentsCount,
        liked: !!userLike
      };
    }));

    res.status(200).json(postsWithStats);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching feed: ' + error.message });
  }
};

// Get posts by a specific user
exports.getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.params.userId })
      .populate('author', 'username fullName profilePhoto')
      .sort({ createdAt: -1 });

    const postsWithStats = await Promise.all(posts.map(async (post) => {
      const likesCount = await Like.countDocuments({ post: post._id });
      const commentsCount = await Comment.countDocuments({ post: post._id });
      const userLike = await Like.findOne({ post: post._id, user: req.user.id });

      return {
        ...post.toObject(),
        likesCount,
        commentsCount,
        liked: !!userLike
      };
    }));

    res.status(200).json(postsWithStats);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching user posts: ' + error.message });
  }
};

// Edit a post
exports.updatePost = async (req, res) => {
  try {
    const { text, mediaUrl, mediaType } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to edit this post' });
    }

    post.text = text || post.text;
    post.mediaUrl = mediaUrl !== undefined ? mediaUrl : post.mediaUrl;
    post.mediaType = mediaType !== undefined ? mediaType : post.mediaType;
    post.isEdited = true;

    await post.save();

    const populatedPost = await Post.findById(post._id).populate('author', 'username fullName profilePhoto');
    const likesCount = await Like.countDocuments({ post: post._id });
    const commentsCount = await Comment.countDocuments({ post: post._id });
    const userLike = await Like.findOne({ post: post._id, user: req.user.id });

    const postObj = {
      ...populatedPost.toObject(),
      likesCount,
      commentsCount,
      liked: !!userLike
    };

    res.status(200).json(postObj);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating post: ' + error.message });
  }
};

// Delete a post
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await Post.deleteOne({ _id: req.params.id });

    // Clean up related Comments and Likes
    await Comment.deleteMany({ post: req.params.id });
    await Like.deleteMany({ post: req.params.id });

    res.status(200).json({ message: 'Post and related comments/likes deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting post: ' + error.message });
  }
};
