import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/auth/forgot-password', { email });
      setMessage(res.data.message);
      if (res.data.previewUrl) {
        setPreviewUrl(res.data.previewUrl);
      }
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error sending request');
    }
  };

  return (
    <div className="glass-container">
      <div className="auth-header fade-in">
        <h1>Forgot Password</h1>
      </div>
      {error && <p className="error-text">{error}</p>}
          {message && (
            <div className="text-center">
              <p style={{ color: '#22c55e', marginBottom: '1rem' }}>{message}</p>
              {previewUrl && (
                <div style={{ marginTop: '10px', padding: '15px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '8px', border: '1px solid #22c55e' }}>
                    <p style={{ fontSize: '0.9rem', color: '#f3f4f6', marginBottom: '10px' }}>Dev Mode: A test email was sent!</p>
                    <a href={previewUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-primary" style={{ width: 'auto' }}>
                      View Email Content
                    </a>
                </div>
              )}
            </div>
          )}
      
      {!message && (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input 
              type="email" 
              className="form-input" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" className="btn btn-primary">Send Reset Link</button>
        </form>
      )}
      
      <div className="text-center mt-4">
        <Link to="/login" className="auth-link">Back to Login</Link>
      </div>
    </div>
  );
}

export default ForgotPassword;
