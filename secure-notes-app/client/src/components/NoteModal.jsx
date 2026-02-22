import { useState, useEffect } from 'react';
import api from '../utils/api';
import './NoteModal.css';

const NoteModal = ({ note, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    isPinned: false,
  });
  const [file, setFile] = useState(null);
  const [existingFile, setExistingFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (note) {
      setFormData({
        title: note.title,
        content: note.content,
        isPinned: note.isPinned || false,
      });
      setExistingFile(note.file || null);
    }
  }, [note]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check file size (10MB limit)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        e.target.value = '';
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    document.getElementById('file-input').value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Title and content are required');
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('content', formData.content);
      formDataToSend.append('isPinned', formData.isPinned);

      if (file) {
        formDataToSend.append('file', file);
      }

      if (note) {
        // Update existing note
        await api.put(`/notes/${note._id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        // Create new note
        await api.post('/notes', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      onSave();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save note');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFile = async () => {
    if (!window.confirm('Are you sure you want to delete this file?')) {
      return;
    }

    try {
      await api.delete(`/notes/${note._id}/file`);
      setExistingFile(null);
      alert('File deleted successfully');
    } catch (err) {
      alert('Failed to delete file');
      console.error(err);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{note ? 'Edit Note' : 'Create New Note'}</h2>
          <button className="btn-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="note-form">
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter note title"
              required
              maxLength={200}
            />
          </div>

          <div className="form-group">
            <label htmlFor="content">Content *</label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Write your note here..."
              required
              rows={8}
              maxLength={10000}
            />
          </div>

          <div className="form-group-checkbox">
            <input
              type="checkbox"
              id="isPinned"
              name="isPinned"
              checked={formData.isPinned}
              onChange={handleChange}
            />
            <label htmlFor="isPinned">📌 Pin this note</label>
          </div>

          <div className="form-group">
            <label htmlFor="file-input">
              🔐 Encrypted File Attachment (Optional)
            </label>
            
            {existingFile && !file && (
              <div className="existing-file">
                <div className="file-info">
                  <span className="file-icon">📎</span>
                  <span className="file-name">{existingFile.originalName}</span>
                </div>
                <button
                  type="button"
                  className="btn-remove"
                  onClick={handleDeleteFile}
                >
                  Remove
                </button>
              </div>
            )}

            <input
              type="file"
              id="file-input"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif,.webp,.zip"
            />

            {file && (
              <div className="file-preview">
                <div className="file-info">
                  <span className="file-icon">📎</span>
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <button
                  type="button"
                  className="btn-remove"
                  onClick={handleRemoveFile}
                >
                  Remove
                </button>
              </div>
            )}

            <p className="help-text">
              Max file size: 10MB. Files are automatically encrypted before
              storage.
            </p>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : note ? 'Update Note' : 'Create Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NoteModal;
