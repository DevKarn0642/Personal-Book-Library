// app.js
const express = require('express');

const app = express();

app.use(express.json());

// routes ต่าง ๆ
// app.use('/api/users', userRoutes);

module.exports = app;