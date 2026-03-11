import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
}, { timestamps: true });

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  fileUrl: { type: String },
  fileName: { type: String },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  comments: [commentSchema]
}, { timestamps: true });

export default mongoose.model('Post', postSchema);
