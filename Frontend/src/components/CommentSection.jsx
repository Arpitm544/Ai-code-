import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CommentSection = ({ projectId, username }) => {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');

  useEffect(() => {
    axios.get(`http://localhost:5000/api/comments/${projectId}`)
      .then(res => setComments(res.data));
  }, [projectId]);

  const handleAdd = async () => {
    if (!text.trim()) return;
    const res = await axios.post('http://localhost:5000/api/comments', {
      projectId, user: username, text
    });
    setComments([...comments, res.data]);
    setText('');
  };

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:5000/api/comments/${id}`);
    setComments(comments.filter(c => c._id !== id));
  };

  return (
    <div className="comment-section">
      <h4>Comments</h4>
      <div>
        {comments.map(c => (
          <div key={c._id} className="comment">
            <b>{c.user}</b> <span>({new Date(c.createdAt).toLocaleString()})</span>
            <p>{c.text}</p>
            {c.user === username && (
              <button onClick={() => handleDelete(c._id)}>Delete</button>
            )}
          </div>
        ))}
      </div>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Add a comment..."
      />
      <button onClick={handleAdd}>Add Comment</button>
    </div>
  );
};

export default CommentSection; 