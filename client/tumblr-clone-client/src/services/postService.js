import axios from 'axios';

const API_URL = 'http://localhost:5001/posts'; // Backend URL

export const fetchPosts = async () => {
    try {
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        console.error('Error fetching posts:', error);
        throw error;
    }
};


// Create a new post
export const createPost = async (title, content) => {
    try {
        const response = await axios.post(API_URL, { title, content });
        return response.data;
    } catch (error) {
        console.error('Error creating post:', error);
        throw error;
    }
};

// Delete a Post
export const deletePost = async (id) => {
    try {
        await axios.delete(`http://localhost:5001/posts/${id}`);
    } catch (error) {
        console.error('Error deleting post:', error);
        throw error;
    }
};

// Update a post
export const updatePost = async (id, title, content) => {
    try {
        const response = await axios.put(`http://localhost:5001/posts/${id}`, { title, content });
        return response.data;
    } catch (error) {
        console.error('Error updating post:', error);
        throw error;
    }
};


// Fetch paginated posts
export const fetchPaginatedPosts = async (page, limit) => {
    try {
        const response = await axios.get('http://localhost:5001/posts', {
            params: { page, limit },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching paginated posts:', error);
        throw error;
    }
};
