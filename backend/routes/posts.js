import express from 'express';
import multer from 'multer';
import path from 'path';
import Post from '../models/Post.js';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';
import fs from 'fs';

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Create a post
router.post('/', requireAuth, upload.single('file'), async (req, res) => {
  try {
    const { title, description } = req.body;
    let fileUrl = '';
    let fileName = '';

    if (req.file) {
      fileUrl = `/uploads/${req.file.filename}`;
      fileName = req.file.originalname;
    }

    const newPost = new Post({
      title,
      description,
      fileUrl,
      fileName,
      author: req.user._id
    });

    await newPost.save();
    
    // Populate author before sending
    await newPost.populate('author', 'name email branch year');

    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get posts with optional filters
router.get('/', async (req, res) => {
  try {
    const { branch, year, search } = req.query;
    
    let userFilter = {};
    let isUserFiltered = false;
    if (branch && branch !== 'All Branches') {
      userFilter.branch = branch;
      isUserFiltered = true;
    }
    if (year && year !== 'All Years') {
      userFilter.year = Number(year);
      isUserFiltered = true;
    }

    let postFilter = {};
    if (search) {
      postFilter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // If filtering by branch/year, we need to find matching authors first
    if (isUserFiltered) {
      const matchingUsers = await User.find(userFilter).select('_id');
      const authorIds = matchingUsers.map(u => u._id);
      postFilter.author = { $in: authorIds };
    }

    const posts = await Post.find(postFilter)
                            .populate('author', 'name email branch year')
                            .populate('comments.author', 'name email branch year')
                            .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a post
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await post.deleteOne();
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add a comment
router.post('/:postId/comments', requireAuth, async (req, res) => {
  try {
    const { text } = req.body;
    const post = await Post.findById(req.params.postId);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const newComment = {
      author: req.user._id,
      text
    };

    post.comments.push(newComment);
    await post.save();

    await post.populate('comments.author', 'name email branch year');
    
    res.status(201).json(post.comments[post.comments.length - 1]);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
