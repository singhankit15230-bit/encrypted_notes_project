import { useState, useEffect } from 'react';
import api from '../utils/api';
import NoteCard from '../components/NoteCard';
import NoteModal from '../components/NoteModal';
import './Dashboard.css';

const Dashboard = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editNote, setEditNote] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await api.get('/notes');
      setNotes(response.data.notes);
      setError('');
    } catch (err) {
      setError('Failed to load notes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = () => {
    setEditNote(null);
    setShowModal(true);
  };

  const handleEditNote = (note) => {
    setEditNote(note);
    setShowModal(true);
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return;
    }

    try {
      await api.delete(`/notes/${noteId}`);
      setNotes(notes.filter((note) => note._id !== noteId));
    } catch (err) {
      alert('Failed to delete note');
      console.error(err);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditNote(null);
  };

  const handleNoteSaved = () => {
    fetchNotes();
    handleModalClose();
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your notes...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>My Notes</h1>
          <p className="dashboard-subtitle">
            {notes.length} {notes.length === 1 ? 'note' : 'notes'} total
          </p>
        </div>
        <button className="btn-create" onClick={handleCreateNote}>
          ➕ Create Note
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {notes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h2>No notes yet</h2>
          <p>Create your first secure note to get started</p>
          <button className="btn-primary" onClick={handleCreateNote}>
            Create Your First Note
          </button>
        </div>
      ) : (
        <div className="notes-grid">
          {notes.map((note) => (
            <NoteCard
              key={note._id}
              note={note}
              onEdit={handleEditNote}
              onDelete={handleDeleteNote}
            />
          ))}
        </div>
      )}

      {showModal && (
        <NoteModal
          note={editNote}
          onClose={handleModalClose}
          onSave={handleNoteSaved}
        />
      )}
    </div>
  );
};

export default Dashboard;
