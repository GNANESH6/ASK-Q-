import React, { useState } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';

function ResetPassword() {
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/auth/reset-password', { token, newPassword });
      setMessage(res.data.message);
      setError('');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error resetting password');
    }
  };

  return (
    <div className="glass-container">
      <div className="auth-header fade-in">
        <h1>Reset Password</h1>
      </div>
      {error && <p className="error-text">{error}</p>}
      {message && <p style={{ color: 'green', textAlign: 'center' }}>{message}</p>}
      
      {!message && (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input 
              type="password" 
              className="form-input" 
              value={newPassword} 
              onChange={e => setNewPassword(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" className="btn btn-primary">Reset Password</button>
        </form>
      )}
      
      <div className="text-center mt-4">
        <Link to="/login" className="auth-link">Back to Login</Link>
      </div>
    </div>
  );
}

export default ResetPassword;
