require('dotenv').config();
const ex = require('express');
const connectDB = require('./config/db');
const app = ex();

connectDB();
app.use(ex.json());

const authRoutes = require('./routes/authRoutes');

app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.status(200).json({ message: 'Welcome to Enawra API' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});