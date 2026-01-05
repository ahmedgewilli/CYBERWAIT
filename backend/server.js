const express = require('express');
const cors = require('cors');
require('dotenv').config();

const menuRoutes = require('./routes/menu');
const orderRoutes = require('./routes/orders');
const trackingRoutes = require('./routes/tracking');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/tracking', trackingRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

