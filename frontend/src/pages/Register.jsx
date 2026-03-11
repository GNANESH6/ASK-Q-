import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Register() {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', branch: 'CSE', year: 1
  });
  const [error, setError] = useState('');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="glass-container">
      <div className="auth-header">
        <h1>Register for ASK-Q</h1>
      </div>
      {error && <p className="error-text">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input type="text" className="form-input" name="name" onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label className="form-label">College Email</label>
          <input type="email" className="form-input" name="email" onChange={handleChange} placeholder="e.g. college@srit.ac.in" required />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input type="password" className="form-input" name="password" onChange={handleChange} required />
        </div>
        <div className="form-group" style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <label className="form-label">Branch</label>
            <select className="form-input" name="branch" onChange={handleChange} required>
              <option value="CSE">CSE</option>
              <option value="ECE">ECE</option>
              <option value="EEE">EEE</option>
              <option value="CIVIL">CIVIL</option>
              <option value="MECH">MECH</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label className="form-label">Year of Study</label>
            <select className="form-input" name="year" onChange={handleChange} required>
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
            </select>
          </div>
        </div>
        <button type="submit" className="btn btn-primary">Register</button>
      </form>
      <div className="text-center mt-4">
        Already have an account? <Link to="/login" className="auth-link">Login</Link>
      </div>
    </div>
  );
}

export default Register;
