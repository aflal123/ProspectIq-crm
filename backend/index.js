// backend/index.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
// app.use(helmet());
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: false,
}))
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// ==================== ROUTES ====================
const authRoutes = require('./src/routes/auth');
const aiRoutes = require('./src/routes/ai');
const leadRoutes = require('./src/routes/leads');
const notesRoutes = require('./src/routes/notes')
const dashboardRoutes = require('./src/routes/dashboard')

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/notes', notesRoutes)
app.use('/api/dashboard', dashboardRoutes)

// Health Check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    app: 'ProspectIQ',
    version: '1.0',
    time: new Date().toISOString()
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 ProspectIQ Backend running on http://localhost:${PORT}`);
});