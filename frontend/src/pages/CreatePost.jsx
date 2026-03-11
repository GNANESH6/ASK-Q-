import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function CreatePost() {
  const [formData, setFormData] = useState({
    title: '', description: ''
  });
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('branch', user.branch);
    data.append('year', user.year);
    if (file) {
      data.append('file', file);
    }

    try {
      await axios.post('/posts', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating post');
    }
  };

  return (
    <div className="glass-container">
      <div className="auth-header">
        <h1>Create Post</h1>
      </div>
      {error && <p className="error-text">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input 
            type="text" 
            className="form-input" 
            name="title" 
            placeholder="Title" 
            onChange={(e) => setFormData({...formData, title: e.target.value})} 
            required 
          />
        </div>
        <div className="form-group">
          <textarea 
            className="form-input" 
            name="description" 
            placeholder="Description" 
            onChange={(e) => setFormData({...formData, description: e.target.value})} 
            required 
          ></textarea>
        </div>
        <div className="form-group" style={{ 
          border: '1px dashed var(--primary-orange)', 
          padding: '1rem', 
          borderRadius: '6px' 
        }}>
          <input type="file" onChange={handleFileChange} />
        </div>
        <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#ea580c' }}>
          Create Post
        </button>
      </form>
    </div>
  );
}

export default CreatePost;
