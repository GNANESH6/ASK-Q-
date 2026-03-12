import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Search } from 'lucide-react';

function ViewPosts() {
  const [posts, setPosts] = useState([]);
  const [filters, setFilters] = useState({ branch: 'All Branches', year: 'All Years', search: '' });
  const [commentInputs, setCommentInputs] = useState({});
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchPosts();
  }, [filters]);

  const fetchPosts = async () => {
    try {
      const res = await axios.get('/posts', { params: filters });
      setPosts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleDelete = async (postId) => {
    if (window.confirm('Delete this post?')) {
      try {
        await axios.delete(`/posts/${postId}`);
        fetchPosts();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const submitComment = async (postId) => {
    const text = commentInputs[postId];
    if (!text) return;
    try {
      const res = await axios.post(`/posts/${postId}/comments`, { text });
      // Update locally
      const updatedPosts = posts.map(p => {
        if (p._id === postId) {
          return { ...p, comments: [...p.comments, res.data] };
        }
        return p;
      });
      setPosts(updatedPosts);
      setCommentInputs({ ...commentInputs, [postId]: '' });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="wide-container fade-in">
      <h1 className="mb-4" style={{ color: 'white' }}>All Posts</h1>
      
      <div className="filters-bar">
        <select className="filter-select" name="branch" onChange={handleFilterChange} value={filters.branch}>
          <option>All Branches</option>
          <option>CSE</option>
          <option>ECE</option>
          <option>EEE</option>
          <option>CIVIL</option>
          <option>MECH</option>
        </select>
        
        <select className="filter-select" name="year" onChange={handleFilterChange} value={filters.year}>
          <option>All Years</option>
          <option>1</option>
          <option>2</option>
          <option>3</option>
          <option>4</option>
        </select>
        
        <div style={{ position: 'relative', flex: 1 }}>
          <Search style={{ position: 'absolute', top: '50%', left: '10px', transform: 'translateY(-50%)', color: 'var(--text-muted)', width: '18px' }} />
          <input 
            type="text" 
            className="form-input filter-search" 
            name="search" 
            placeholder="Search..." 
            style={{ paddingLeft: '35px' }}
            onChange={(e) => {
              // Debounce not strictly required but wait before calling api
              setFilters({ ...filters, search: e.target.value });
            }}
          />
        </div>
      </div>

      {posts.map(post => (
        <div key={post._id} className="post-card">
          <div className="post-header">
            <div>
              <h2 className="post-title">{post.title}</h2>
              <div className="post-meta">
                {post.author?.branch || 'Unknown'} | Year {post.author?.year || 'Unknown'}
              </div>
            </div>
            {user && user._id === (post.author?._id || post.author) && (
              <button className="btn btn-sm btn-danger" style={{ backgroundColor: '#ea580c' }} onClick={() => handleDelete(post._id)}>Delete</button>
            )}
          </div>
          
          <p className="post-description">{post.description}</p>
          
          {post.fileUrl && (
            <div className="post-attachment">
              <a href={`https://ask-q.onrender.com${post.fileUrl}`} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-orange)', textDecoration: 'none', fontWeight: '500' }}>
                📎 {post.fileName || 'View Attachment'}
              </a>
              {post.fileUrl.match(/\.(jpeg|jpg|gif|png)$/i) && (
                <div>
                  <img src={`https://ask-q.onrender.com${post.fileUrl}`} alt="attachment" className="post-image" />
                </div>
              )}
            </div>
          )}

          <div className="comments-section" style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid var(--border-color)' }}>
            <input 
              type="text" 
              className="form-input comment-input" 
              placeholder="comment.." 
              value={commentInputs[post._id] || ''}
              onChange={e => setCommentInputs({...commentInputs, [post._id]: e.target.value})}
              style={{ borderRadius: '20px', padding: '0.5rem 1rem' }}
            />
            <button className="btn btn-sm btn-primary" style={{ backgroundColor: '#ea580c', borderRadius: '20px' }} onClick={() => submitComment(post._id)}>Send</button>
          </div>
          
          {post.comments && post.comments.length > 0 && (
            <div className="comment-list">
              {post.comments.map(c => (
                <div key={c._id} className="comment-item">
                  <div className="comment-text">{c.text}</div>
                  <div style={{ fontSize: '0.65rem', color: '#9ca3af', marginTop: '4px', display: 'flex', gap: '8px' }}>
                    <span>{c.author?.branch || 'User'} - {c.author?.year ? `Year ${c.author.year}` : ''}</span>
                    <span>•</span>
                    <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {posts.length === 0 && (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No posts found.</p>
      )}
    </div>
  );
}

export default ViewPosts;
