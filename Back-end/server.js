const ex = require('express');
require('dotenv').config();
const app = ex();

app.use(ex.json());
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Welcome to Enawra API' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});