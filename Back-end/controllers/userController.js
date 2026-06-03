const User = require('../models/User');

// Get current user profile
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching profile: ' + error.message });
  }
};

// Get any user's profile by ID
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching user profile: ' + error.message });
  }
};

// Get user profile by username
exports.getUserByUsername = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching user profile: ' + error.message });
  }
};

// Search users by name/username
exports.searchUsers = async (req, res) => {
  try {
    const query = req.query.q || '';
    if (!query) {
      // Return first 10 users as suggestions if query is empty
      const suggestions = await User.find({ _id: { $ne: req.user.id } })
        .select('-password')
        .limit(10);
      return res.status(200).json(suggestions);
    }
    const users = await User.find({
      $and: [
        { _id: { $ne: req.user.id } }, // Don't search self
        {
          $or: [
            { username: { $regex: query, $options: 'i' } },
            { fullName: { $regex: query, $options: 'i' } }
          ]
        }
      ]
    }).select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error searching users: ' + error.message });
  }
};

// Toggle follow/unfollow
exports.toggleFollow = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user.id;

    if (targetUserId === currentUserId) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser || !currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isFollowing = currentUser.following.includes(targetUserId);

    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter(id => id.toString() !== targetUserId);
      targetUser.followers = targetUser.followers.filter(id => id.toString() !== currentUserId);
    } else {
      // Follow
      currentUser.following.push(targetUserId);
      targetUser.followers.push(currentUserId);
    }

    await currentUser.save();
    await targetUser.save();

    res.status(200).json({
      message: isFollowing ? 'Unfollowed successfully' : 'Followed successfully',
      isFollowing: !isFollowing,
      followersCount: targetUser.followers.length,
      followingCount: currentUser.following.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error toggling follow status: ' + error.message });
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    const { fullName, profilePhoto } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (fullName) user.fullName = fullName;
    if (profilePhoto !== undefined) user.profilePhoto = profilePhoto;

    await user.save();

    const updatedUser = await User.findById(req.user.id).select('-password');
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating profile: ' + error.message });
  }
};
