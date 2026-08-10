const express = require('express');
const healthRoutes = require('./routes/health.routes');

const app = express();

app.use(healthRoutes);

module.exports = app;
