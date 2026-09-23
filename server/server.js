const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const opportunityRoutes = require('./routes/opportunities.routes');
const rewardRoutes = require('./routes/rewards.routes');
const entityRoutes = require('./routes/entities.routes');
const organizationRoutes = require('./routes/organizations.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/entities', entityRoutes);
app.use('/api/organizations', organizationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), platform: '3-Entity Referral Tracker' });
});

// Serve frontend in production if built
const clientDist = path.join(__dirname, '../client/dist');
app.use(express.static(clientDist));

app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Endpoint not found' });
  }
  const indexPath = path.join(clientDist, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.send(`<h2>Referral & Rewards Platform API Server Running on port ${PORT}</h2><p>Vite Dev Server runs on port 5173 for development UI.</p>`);
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Platform Backend Server running on http://localhost:${PORT}`);
});
