import express from 'express';
import cors from 'cors';
import { connectDB } from './config/database.js';
import { config } from './config/config.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import noteRoutes from './routes/noteRoutes.js';

// Initialize express app
const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Secure Notes API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      notes: '/api/notes'
    }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`🚀 Server running in ${config.nodeEnv} mode on port ${PORT}`);
  console.log(`📝 API available at http://localhost:${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  process.exit(1);
});
