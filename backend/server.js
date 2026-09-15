// server.js
const path = require('node:path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const { createApp } = require('./app');
const { pool } = require('./src/config/connectdb');
const app = createApp({ pool, jwtSecret: process.env.JWT_SECRET });

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
