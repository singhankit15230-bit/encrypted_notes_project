import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
      maxlength: [200, 'Title cannot be more than 200 characters']
    },
    content: {
      type: String,
      required: [true, 'Please provide content'],
      maxlength: [10000, 'Content cannot be more than 10000 characters']
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    file: {
      fileName: {
        type: String
      },
      originalName: {
        type: String
      },
      mimeType: {
        type: String
      },
      size: {
        type: Number
      },
      encryptedPath: {
        type: String
      },
      iv: {
        type: String // Initialization vector for decryption
      }
    },
    isPinned: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Create indexes for better query performance
noteSchema.index({ user: 1, createdAt: -1 });
noteSchema.index({ user: 1, isPinned: -1, createdAt: -1 });

const Note = mongoose.model('Note', noteSchema);

export default Note;
