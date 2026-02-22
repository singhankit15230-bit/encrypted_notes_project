import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { config } from '../config/config.js';

/**
 * Encrypts a file using AES-256-CBC encryption
 * @param {string} filePath - Path to the file to encrypt
 * @returns {Promise<{encryptedPath: string, iv: string}>}
 */
export const encryptFile = async (filePath) => {
  try {
    // Read the file
    const fileBuffer = await fs.readFile(filePath);
    
    // Generate a random initialization vector
    const iv = crypto.randomBytes(16);
    
    // Create cipher
    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      Buffer.from(config.encryptionKey, 'hex'),
      iv
    );
    
    // Encrypt the file
    const encrypted = Buffer.concat([
      cipher.update(fileBuffer),
      cipher.final()
    ]);
    
    // Create encrypted file path
    const encryptedPath = `${filePath}.encrypted`;
    
    // Write encrypted file
    await fs.writeFile(encryptedPath, encrypted);
    
    // Delete original file for security
    await fs.unlink(filePath);
    
    return {
      encryptedPath,
      iv: iv.toString('hex')
    };
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('File encryption failed');
  }
};

/**
 * Decrypts a file using AES-256-CBC decryption
 * @param {string} encryptedPath - Path to the encrypted file
 * @param {string} ivHex - Initialization vector in hex format
 * @returns {Promise<Buffer>}
 */
export const decryptFile = async (encryptedPath, ivHex) => {
  try {
    // Read the encrypted file
    const encryptedBuffer = await fs.readFile(encryptedPath);
    
    // Convert IV from hex to buffer
    const iv = Buffer.from(ivHex, 'hex');
    
    // Create decipher
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      Buffer.from(config.encryptionKey, 'hex'),
      iv
    );
    
    // Decrypt the file
    const decrypted = Buffer.concat([
      decipher.update(encryptedBuffer),
      decipher.final()
    ]);
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('File decryption failed');
  }
};

/**
 * Deletes an encrypted file
 * @param {string} encryptedPath - Path to the encrypted file
 */
export const deleteEncryptedFile = async (encryptedPath) => {
  try {
    await fs.unlink(encryptedPath);
  } catch (error) {
    console.error('File deletion error:', error);
    // Don't throw error - file might already be deleted
  }
};

/**
 * Generates a secure encryption key (for setup)
 */
export const generateEncryptionKey = () => {
  return crypto.randomBytes(32).toString('hex');
};
