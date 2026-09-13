// server.js
require('dotenv').config();

const { createApp } = require('./app');
const { pool } = require('./src/config/connectdb');
const app = createApp({ pool, jwtSecret: process.env.JWT_SECRET });

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
