import axios from 'axios';

// Create an instance of axios pointing to the FastAPI backend port (8000)
const API = axios.create({
  baseURL: 'https://memory-chatbot.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Axios Request Interceptor:
// Automatically hooks into every request and injects the JWT token
// if it is stored in the browser's localStorage.
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- API ENDPOINT CALLS ---

export const authService = {
  /**
   * Register a new user
   */
  signup: async (username, email, password) => {
    const response = await API.post('/signup', { username, email, password });
    return response.data;
  },

  /**
   * Log in an existing user
   * Note: We use URLSearchParams because FastAPI's OAuth2PasswordRequestForm
   * expects the credentials to be sent as application/x-www-form-urlencoded.
   */
  login: async (usernameOrEmail, password) => {
    const params = new URLSearchParams();
    params.append('username', usernameOrEmail);
    params.append('password', password);

    const response = await API.post('/login', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data; // Returns { access_token, token_type }
  },
};

export const chatService = {
  /**
   * Get all chat sessions for the logged-in user
   */
  getUserChats: async () => {
    const response = await API.get('/user/chats');
    return response.data;
  },

  /**
   * Get all messages in a specific chat session
   */
  getChatHistory: async (chatId) => {
    const response = await API.get(`/history/${chatId}`);
    return response.data;
  },

  /**
   * Send a new message to the AI chatbot
   * @param {string} message - User message content
   * @param {number|null} chatId - Active chat ID. If null, backend spawns a new session.
   */
  sendMessage: async (message, chatId = null) => {
    const response = await API.post('/chat', { message, chat_id: chatId });
    return response.data; // Returns { chat_id, response, user_message, ai_message }
  },
};

export default API;
