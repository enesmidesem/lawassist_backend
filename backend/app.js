require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes        = require('./src/modules/auth/auth.routes');
const lawyersRoutes     = require('./src/modules/lawyers/lawyers.routes');
const listingsRoutes = require('./src/modules/listings/listings.routes'); // henüz yazılmadı
const applicationsRoutes = require('./src/modules/applications/applications.routes');
const adminRoutes       = require('./src/modules/admin/admin.routes');

const errorHandler = require('./src/middlewares/errorHandler');

const app = express();

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Routes ---
app.use('/api/auth',         authRoutes);
app.use('/api/lawyers',      lawyersRoutes);
app.use('/api/listings', listingsRoutes); // henüz yazılmadı
app.use('/api/applications', applicationsRoutes);
app.use('/api/admin',        adminRoutes);

// --- 404 ---
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint bulunamadı.' });
});

// --- Global Hata Yakalama (en sonda olmalı) ---
app.use(errorHandler);

module.exports = app;