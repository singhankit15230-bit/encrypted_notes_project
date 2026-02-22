import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/secure-notes-db',
  jwtSecret: process.env.JWT_SECRET,
  jwtExpire: process.env.JWT_EXPIRE || '7d',
  encryptionKey: process.env.ENCRYPTION_KEY,
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760, // 10MB
  uploadDir: process.env.UPLOAD_DIR || 'uploads'
};

// Validate critical configuration
if (!config.jwtSecret) {
  throw new Error('JWT_SECRET must be defined in environment variables');
}

if (!config.encryptionKey) {
  throw new Error('ENCRYPTION_KEY must be defined in environment variables');
}

if (config.encryptionKey.length !== 64) {
  throw new Error('ENCRYPTION_KEY must be 32 bytes (64 hex characters)');
}
