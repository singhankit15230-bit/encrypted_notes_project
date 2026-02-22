import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';
import User from '../models/User.js';

/**
 * Protect routes - verify JWT token
 */
export const protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route. Please login.'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret);

    // Get user from token
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not found. Token is invalid.'
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Invalid token.'
    });
  }
};

/**
 * Generate JWT token
 */
export const generateToken = (id) => {
  return jwt.sign({ id }, config.jwtSecret, {
    expiresIn: config.jwtExpire
  });
};
