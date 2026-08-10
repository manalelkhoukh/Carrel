const express = require('express');
const healthRoutes = require('./routes/health.routes');
const roomsRoutes = require('./routes/rooms.routes');
const seatsRoutes = require('./routes/seats.routes');

const app = express();

app.use(healthRoutes);
app.use(roomsRoutes);
app.use(seatsRoutes);

module.exports = app;
