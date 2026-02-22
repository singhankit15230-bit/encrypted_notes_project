import Note from '../models/Note.js';
import { encryptFile, decryptFile, deleteEncryptedFile } from '../utils/encryption.js';
import path from 'path';

/**
 * @desc    Create a new note
 * @route   POST /api/notes
 * @access  Private
 */
export const createNote = async (req, res, next) => {
  try {
    const { title, content } = req.body;

    // Validate input
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title and content'
      });
    }

    // Create note object
    const noteData = {
      title,
      content,
      user: req.user.id
    };

    // Handle file upload if present
    if (req.file) {
      try {
        // Encrypt the file
        const { encryptedPath, iv } = await encryptFile(req.file.path);

        noteData.file = {
          fileName: req.file.filename,
          originalName: req.file.originalname,
          mimeType: req.file.mimetype,
          size: req.file.size,
          encryptedPath,
          iv
        };
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: 'File encryption failed'
        });
      }
    }

    // Create note
    const note = await Note.create(noteData);

    res.status(201).json({
      success: true,
      message: 'Note created successfully',
      note
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all notes for user
 * @route   GET /api/notes
 * @access  Private
 */
export const getNotes = async (req, res, next) => {
  try {
    const notes = await Note.find({ user: req.user.id })
      .sort({ isPinned: -1, createdAt: -1 })
      .select('-file.encryptedPath -file.iv'); // Don't send sensitive file data

    res.status(200).json({
      success: true,
      count: notes.length,
      notes
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single note
 * @route   GET /api/notes/:id
 * @access  Private
 */
export const getNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id)
      .select('-file.encryptedPath -file.iv');

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    // Check ownership
    if (note.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this note'
      });
    }

    res.status(200).json({
      success: true,
      note
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update note
 * @route   PUT /api/notes/:id
 * @access  Private
 */
export const updateNote = async (req, res, next) => {
  try {
    let note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    // Check ownership
    if (note.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this note'
      });
    }

    const { title, content, isPinned } = req.body;

    // Update basic fields
    if (title) note.title = title;
    if (content) note.content = content;
    if (typeof isPinned !== 'undefined') note.isPinned = isPinned;

    // Handle file upload if present
    if (req.file) {
      // Delete old encrypted file if exists
      if (note.file && note.file.encryptedPath) {
        await deleteEncryptedFile(note.file.encryptedPath);
      }

      try {
        // Encrypt the new file
        const { encryptedPath, iv } = await encryptFile(req.file.path);

        note.file = {
          fileName: req.file.filename,
          originalName: req.file.originalname,
          mimeType: req.file.mimetype,
          size: req.file.size,
          encryptedPath,
          iv
        };
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: 'File encryption failed'
        });
      }
    }

    await note.save();

    // Remove sensitive data before sending response
    const responseNote = note.toObject();
    if (responseNote.file) {
      delete responseNote.file.encryptedPath;
      delete responseNote.file.iv;
    }

    res.status(200).json({
      success: true,
      message: 'Note updated successfully',
      note: responseNote
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete note
 * @route   DELETE /api/notes/:id
 * @access  Private
 */
export const deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    // Check ownership
    if (note.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this note'
      });
    }

    // Delete encrypted file if exists
    if (note.file && note.file.encryptedPath) {
      await deleteEncryptedFile(note.file.encryptedPath);
    }

    await note.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Note deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Download decrypted file
 * @route   GET /api/notes/:id/file
 * @access  Private
 */
export const downloadFile = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    // Check ownership
    if (note.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this file'
      });
    }

    // Check if file exists
    if (!note.file || !note.file.encryptedPath) {
      return res.status(404).json({
        success: false,
        message: 'No file attached to this note'
      });
    }

    // Decrypt file
    const decryptedBuffer = await decryptFile(
      note.file.encryptedPath,
      note.file.iv
    );

    // Set headers for file download
    res.setHeader('Content-Type', note.file.mimeType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${note.file.originalName}"`
    );
    res.setHeader('Content-Length', decryptedBuffer.length);

    // Send decrypted file
    res.send(decryptedBuffer);
  } catch (error) {
    console.error('File download error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to download file'
    });
  }
};

/**
 * @desc    Delete file from note
 * @route   DELETE /api/notes/:id/file
 * @access  Private
 */
export const deleteFile = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    // Check ownership
    if (note.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this note'
      });
    }

    // Check if file exists
    if (!note.file || !note.file.encryptedPath) {
      return res.status(404).json({
        success: false,
        message: 'No file attached to this note'
      });
    }

    // Delete encrypted file
    await deleteEncryptedFile(note.file.encryptedPath);

    // Remove file data from note
    note.file = undefined;
    await note.save();

    res.status(200).json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
