const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { username, email, fullName, password, dateOfBirth, profilePhoto } = req.body;

    const userExists = await User.findOne({ $or: [{ email }, { username }] });

    if (userExists) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      fullName,
      password: hashedPassword,
      dateOfBirth,
      profilePhoto: profilePhoto || ""
    });

    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: newUser._id, username: newUser.username, email: newUser.email, fullName: newUser.fullName, profilePhoto: newUser.profilePhoto } });
    } catch (error) {
        res.status(500).json({ message: 'Server error during registration' });
    }   
};

exports.login = async (req, res) => {
  try {
    const { identity, password } = req.body;

    const user = await User.findOne({ $or: [{ email: identity }, { username: identity }] });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({ message: 'Login successful', token, user: { id: user._id, username: user.username, email: user.email, fullName: user.fullName, profilePhoto: user.profilePhoto } });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login, error: ' + error.message });
  }
};