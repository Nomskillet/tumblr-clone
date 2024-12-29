// Updated App.js
import React, { useEffect, useState } from 'react';
import { fetchPaginatedPosts, createPost, deletePost } from './services/postService';
import './styles.css';
import AuthForm from './components/AuthForm';

function App() {
  const [posts, setPosts] = useState([]);
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(5); // Posts per page

  const [token, setToken] = useState(localStorage.getItem('token'));
  const [username, setUsername] = useState(localStorage.getItem('username'));
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);

  useEffect(() => {
    if (isAuthenticated) {
      const getPosts = async () => {
        try {
          const data = await fetchPaginatedPosts(page, limit, token);
          setPosts(data);
        } catch (error) {
          console.error('Failed to load posts:', error);
        }
      };
      getPosts();
    }
  }, [page, limit, isAuthenticated, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image || !caption) {
      alert('Please select an image and enter a caption');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('image', image);
      formData.append('caption', caption);

      const newPost = await createPost(formData, token);
      setPosts([newPost, ...posts]);
      setCaption('');
      setImage(null);
    } catch (error) {
      console.error('Failed to create post:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deletePost(id, token);
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

          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              required
            />
            <input
              type="text"
              placeholder="Caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              required
            />
            <button type="submit">Create Post</button>
          </form>

          <ul>
            {posts.map((post) => (
              <li key={post.id}>
                <img src={`http://localhost:5001${post.image}`} alt={post.caption} style={{ width: '100%', height: 'auto' }} />
                <p>{post.caption}</p>
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