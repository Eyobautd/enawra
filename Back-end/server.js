require('dotenv').config();
const ex = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const app = ex();

connectDB();
app.use(cors());
app.use(ex.json({ limit: '10mb' }));
app.use(ex.urlencoded({ limit: '10mb', extended: true }));

const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');
const likeRoutes = require('./routes/likeRoutes');
const userRoutes = require('./routes/userRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/', (req, res) => {
    res.status(200).json({ message: 'Welcome to Enawra API' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});