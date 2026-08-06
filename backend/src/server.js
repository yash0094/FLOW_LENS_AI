require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const { passport } = require('./config/passport');

const authRoutes = require('./routes/auth.routes');
const uploadRoutes = require('./routes/upload.routes');
const analysisRoutes = require('./routes/analysis.routes');
const sheetsRoutes = require('./routes/sheets.routes');
const reportRoutes = require('./routes/report.routes');
const datasetRoutes = require('./routes/dataset.routes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    secret: process.env.JWT_SECRET || 'flowlens-session-secret',
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'FlowLens API', time: new Date().toISOString() }));

app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/sheets', sheetsRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/datasets', datasetRoutes);

app.use((req, res) => res.status(404).json({ error: 'Route not found.' }));

// Generic error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

app.listen(PORT, () => {
  console.log(`FlowLens API running on http://localhost:${PORT}`);
});
