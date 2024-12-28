import React, { useEffect, useState } from 'react';
import { fetchPaginatedPosts, createPost, deletePost, updatePost } from './services/postService';
import './styles.css';
import AuthForm from './components/AuthForm';

function App() {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(5); // Posts per page

  const [token, setToken] = useState(localStorage.getItem('token'));
  const [username, setUsername] = useState(localStorage.getItem('username'));
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);

  useEffect(() => {
    if (isAuthenticated) {
      const getPosts = async () => {
        try {
          const data = await fetchPaginatedPosts(page, limit);
          setPosts(data);
        } catch (error) {
          console.error('Failed to load posts:', error);
        }
      };
      getPosts();
    }
  }, [page, limit, isAuthenticated]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        const updatedPost = await updatePost(editId, title, content);
        setPosts(posts.map((post) => (post.id === editId ? updatedPost : post)));
        setEditMode(false);
        setEditId(null);
      } else {
        const newPost = await createPost(title, content);
        setPosts([newPost, ...posts]);
      }
      setTitle('');
      setContent('');
    } catch (error) {
      console.error('Failed to save post:', error);
    }
  };

  const handleEdit = (post) => {
    setEditMode(true);
    setEditId(post.id);
    setTitle(post.title);
    setContent(post.content);
  };

  const handleDelete = async (id) => {
    try {
      await deletePost(id);
      setPosts(posts.filter((post) => post.id !== id));
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  const handleNextPage = () => setPage(page + 1);
  const handlePreviousPage = () => setPage(page > 1 ? page - 1 : 1);

  const handleLogin = (userToken, loggedInUsername) => {
    setToken(userToken);
    setUsername(loggedInUsername);
    localStorage.setItem('token', userToken);
    localStorage.setItem('username', loggedInUsername);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setToken(null);
    setUsername(null);
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setIsAuthenticated(false);
  };

  return (
    <div>
      <h1>Tumblr Clone</h1>

      {isAuthenticated ? (
        <>
          <div>
            <p>
              Logged in as: <strong>{username}</strong>
            </p>
            <button onClick={handleLogout}>Logout</button>
          </div>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <textarea
              placeholder="Content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            ></textarea>
            <button type="submit">{editMode ? 'Update Post' : 'Create Post'}</button>
            {editMode && <button onClick={() => setEditMode(false)}>Cancel</button>}
          </form>

          <ul>
            {posts.map((post) => (
              <li key={post.id}>
                <h2>{post.title}</h2>
                <p>{post.content}</p>
                <small>{new Date(post.created_at).toLocaleString()}</small>
                <button onClick={() => handleEdit(post)}>Edit</button>
                <button onClick={() => handleDelete(post.id)}>Delete</button>
              </li>
            ))}
          </ul>

          <div>
            <button onClick={handlePreviousPage} disabled={page === 1}>
              Previous
            </button>
            <span> Page {page} </span>
            <button onClick={handleNextPage}>Next</button>
          </div>
        </>
      ) : (
        <AuthForm setToken={handleLogin} />
      )}
    </div>
  );
}

export default App;




