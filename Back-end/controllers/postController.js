const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Like = require('../models/Like');
const User = require('../models/User');

const getPostWithStats = async (post, userId) => {
  const likesCount = await Like.countDocuments({ post: post._id });
  const commentsCount = await Comment.countDocuments({ post: post._id });
  const repostsCount = await Post.countDocuments({ originalPost: post._id });
  const userLike = await Like.findOne({ post: post._id, user: userId });

  return {
    ...post.toObject(),
    likesCount,
    commentsCount,
    repostsCount,
    liked: !!userLike
  };
};

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
      repostsCount: 0,
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
      .populate({
        path: 'originalPost',
        populate: {
          path: 'author',
          select: 'username fullName profilePhoto'
        }
      })
      .sort({ createdAt: -1 });

    const postsWithStats = await Promise.all(posts.map((post) => getPostWithStats(post, req.user.id)));

    res.status(200).json(postsWithStats);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching feed: ' + error.message });
  }
};

// Get following feed
exports.getFollowingFeed = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const followingIds = currentUser.following || [];

    // Also include own posts? Usually yes, but the user didn't explicitly ask. Let's just do following for now, or both.
    // "Fetch and render posts exclusively from user IDs present in the current user's following array." -> so only following.
    const posts = await Post.find({ author: { $in: followingIds } })
      .populate('author', 'username fullName profilePhoto')
      .populate({
        path: 'originalPost',
        populate: {
          path: 'author',
          select: 'username fullName profilePhoto'
        }
      })
      .sort({ createdAt: -1 });

    const postsWithStats = await Promise.all(posts.map((post) => getPostWithStats(post, req.user.id)));

    res.status(200).json(postsWithStats);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching following feed: ' + error.message });
  }
};

// Get posts by a specific user
exports.getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.params.userId })
      .populate('author', 'username fullName profilePhoto')
      .populate({
        path: 'originalPost',
        populate: {
          path: 'author',
          select: 'username fullName profilePhoto'
        }
      })
      .sort({ createdAt: -1 });

    const postsWithStats = await Promise.all(posts.map((post) => getPostWithStats(post, req.user.id)));

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

    if (post.originalPost) {
      return res.status(403).json({ message: 'Cannot edit a reposted post' });
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

    const postObj = await getPostWithStats(populatedPost, req.user.id);

    res.status(200).json(postObj);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating post: ' + error.message });
  }
};

// Repost a post
exports.repostPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('originalPost');
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const rootPost = post.originalPost || post;

    const newPost = new Post({
      author: req.user.id,
      originalPost: rootPost._id,
      text: ''
    });

    await newPost.save();

    // Create notification for original post author if they didn't repost their own post
    if (rootPost.author.toString() !== req.user.id) {
      const Notification = require('../models/Notification');
      await Notification.create({
        recipient: rootPost.author,
        sender: req.user.id,
        type: 'repost',
        post: rootPost._id
      });
    }

    const populatedPost = await Post.findById(newPost._id)
      .populate('author', 'username fullName profilePhoto')
      .populate({
        path: 'originalPost',
        populate: {
          path: 'author',
          select: 'username fullName profilePhoto'
        }
      });

    const postObj = {
      ...populatedPost.toObject(),
      likesCount: 0,
      commentsCount: 0,
      repostsCount: 0,
      liked: false
    };

    res.status(201).json(postObj);
  } catch (error) {
    res.status(500).json({ message: 'Server error reposting post: ' + error.message });
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
