require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const User = require('./models/User');
const Post = require('./models/Post');
const Comment = require('./models/Comment');
const Like = require('./models/Like');
const Notification = require('./models/Notification');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/Enawra';

// Premium profile photos
const AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200'
];

const seedDB = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected successfully. Cleaning collections...');

    // Clear existing data
    await User.deleteMany({});
    await Post.deleteMany({});
    await Comment.deleteMany({});
    await Like.deleteMany({});
    await Notification.deleteMany({});
    console.log('Cleared existing User, Post, Comment, Like, and Notification collections.');

    // Generate hashed password (123456)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);

    // 1. Create seed Users
    console.log('Generating seed users...');
    const usersData = [
      {
        username: 'eyob',
        email: 'eyob@enawra.com',
        fullName: 'Eyob Daniel',
        password: hashedPassword,
        profilePhoto: AVATARS[0],
        dateOfBirth: new Date('2000-01-01'),
        followers: [],
        following: []
      },
      {
        username: 'faizan',
        email: 'faizan@enawra.com',
        fullName: 'Faizan Ahmad',
        password: hashedPassword,
        profilePhoto: AVATARS[1],
        dateOfBirth: new Date('1998-05-15'),
        followers: [],
        following: []
      },
      {
        username: 'jsmastery',
        email: 'jsm@enawra.com',
        fullName: 'JavaScript Mastery',
        password: hashedPassword,
        profilePhoto: AVATARS[2],
        dateOfBirth: new Date('1995-10-20'),
        followers: [],
        following: []
      },
      {
        username: 'anapablova',
        email: 'ana@enawra.com',
        fullName: 'Ana Pablova',
        password: hashedPassword,
        profilePhoto: AVATARS[3],
        dateOfBirth: new Date('2001-08-12'),
        followers: [],
        following: []
      },
      {
        username: 'lee_dev',
        email: 'lee@enawra.com',
        fullName: 'David Lee',
        password: hashedPassword,
        profilePhoto: AVATARS[4],
        dateOfBirth: new Date('1997-03-24'),
        followers: [],
        following: []
      }
    ];

    const users = await User.insertMany(usersData);
    console.log(`Inserted ${users.length} users successfully!`);

    // Setup follows (make them follow each other for a rich initial experience)
    users[0].following.push(users[1]._id, users[2]._id);
    users[0].followers.push(users[3]._id, users[4]._id);

    users[1].following.push(users[0]._id, users[2]._id, users[3]._id);
    users[1].followers.push(users[0]._id, users[4]._id);

    users[2].following.push(users[0]._id, users[1]._id);
    users[2].followers.push(users[0]._id, users[1]._id, users[3]._id);

    await Promise.all(users.map(u => u.save()));
    console.log('Wired follow and follower relationships.');

    // 2. Create seed Posts
    console.log('Generating seed posts...');
    const postsData = [
      {
        author: users[0]._id,
        text: 'Welcome to ENAWERA! 🚀 A premium social space built with React, Tailwind CSS, Express, and Mongoose. Happy building!'
      },
      {
        author: users[1]._id,
        text: 'Writing clean code is like writing good prose. Focus on clarity and simplicity first, optimization later.'
      },
      {
        author: users[2]._id,
        text: 'Vite 8.0 is incredibly fast! Cold starts are virtually instant. Highly recommend transitioning from webpack if you haven\'t already.'
      },
      {
        author: users[3]._id,
        text: 'Just finished designing a glassmorphism dashboard. The Harmony of subtle gradients and blurred glass makes it feel so premium. What do you think?'
      },
      {
        author: users[4]._id,
        text: 'Debugging Node.js memory leaks today. Remember to always clean up your event listeners and database connections in production.'
      },
      {
        author: users[0]._id,
        text: 'Connected the backend Mongoose layer directly to the frontend React controllers. Having preloaded stats for likes and comments makes the feed feel so responsive.'
      },
      {
        author: users[2]._id,
        text: 'Advanced Agentic workflows are transforming software engineering. Writing prompts for agents is quickly becoming a core architectural skill.'
      }
    ];

    const posts = await Post.insertMany(postsData);
    console.log(`Inserted ${posts.length} posts successfully!`);

    // 3. Create seed Likes
    console.log('Generating seed likes...');
    const likesData = [
      { post: posts[0]._id, user: users[1]._id },
      { post: posts[0]._id, user: users[2]._id },
      { post: posts[0]._id, user: users[3]._id },
      { post: posts[1]._id, user: users[0]._id },
      { post: posts[1]._id, user: users[2]._id },
      { post: posts[2]._id, user: users[0]._id },
      { post: posts[2]._id, user: users[1]._id },
      { post: posts[3]._id, user: users[0]._id },
      { post: posts[5]._id, user: users[1]._id }
    ];

    const likes = await Like.insertMany(likesData);
    console.log(`Inserted ${likes.length} likes successfully!`);

    // 4. Create seed Comments
    console.log('Generating seed comments...');
    const commentsData = [
      {
        post: posts[0]._id,
        user: users[1]._id,
        text: 'This platform looks incredibly clean! Awesome work.'
      },
      {
        post: posts[0]._id,
        user: users[2]._id,
        text: 'Agreed, design aesthetics are top-tier. Keep it up!'
      },
      {
        post: posts[1]._id,
        user: users[0]._id,
        text: 'So true. Premature optimization is the root of all evil.'
      },
      {
        post: posts[2]._id,
        user: users[1]._id,
        text: 'Completely agree, HMR in Vite is an absolute game changer.'
      },
      {
        post: posts[3]._id,
        user: users[4]._id,
        text: 'Would love to see some screenshots! Glassmorphism works beautifully when contrasted well.'
      }
    ];

    const comments = await Comment.insertMany(commentsData);
    console.log(`Inserted ${comments.length} comments successfully!`);

    console.log('Database seeded successfully! 🎉');
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed database:', error);
    process.exit(1);
  }
};

seedDB();
