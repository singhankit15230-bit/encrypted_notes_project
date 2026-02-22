import express from 'express';
import {
  createNote,
  getNotes,
  getNote,
  updateNote,
  deleteNote,
  downloadFile,
  deleteFile
} from '../controllers/noteController.js';
import { protect } from '../middleware/auth.js';
import { upload, handleMulterError } from '../utils/fileUpload.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router
  .route('/')
  .get(getNotes)
  .post(upload.single('file'), handleMulterError, createNote);

router
  .route('/:id')
  .get(getNote)
  .put(upload.single('file'), handleMulterError, updateNote)
  .delete(deleteNote);

router.get('/:id/file', downloadFile);
router.delete('/:id/file', deleteFile);

export default router;
