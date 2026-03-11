import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="glass-container">
      <div className="auth-header">
        <h1>ASK-Q Login</h1>
      </div>
      {error && <p className="error-text">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">College Email</label>
          <input 
            type="email" 
            className="form-input" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
            placeholder="e.g. college@srit.ac.in"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input 
            type="password" 
            className="form-input" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
          />
        </div>
        <button type="submit" className="btn btn-primary">Login</button>
      </form>
      <div className="text-center mt-4">
        <Link to="/forgot-password" className="auth-link">Forgot Password?</Link>
        <br/><br/>
        Don't have an account? <Link to="/register" className="auth-link">Register</Link>
      </div>
    </div>
  );
}

export default Login;
