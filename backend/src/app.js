const express = require('express');
const healthRoutes = require('./routes/health.routes');
const roomsRoutes = require('./routes/rooms.routes');
const seatsRoutes = require('./routes/seats.routes');
const reservationsRoutes = require('./routes/reservations.routes');

const app = express();

app.use(express.json());

app.use(healthRoutes);
app.use(roomsRoutes);
app.use(seatsRoutes);
app.use(reservationsRoutes);

module.exports = app;
