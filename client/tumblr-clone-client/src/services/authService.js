import axios from 'axios';

const API_URL = 'http://localhost:5001'; // Replace with your API URL

export const loginUser = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { username, password });
    return response.data; // { token, username }
  } catch (error) {
    throw error.response.data; // Error returned by the server
  }
};

export const registerUser = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/register`, { username, password });
    return response.data; // { message }
  } catch (error) {
    throw error.response.data; // Error returned by the server
  }
};

