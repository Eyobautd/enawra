const BASE_URL = '/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response) => {
  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const errorMsg = data?.message || response.statusText || 'Request failed';
    throw new Error(errorMsg);
  }

  return data;
};

export const api = {
  auth: {
    register: async (userData) => {
      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      return handleResponse(res);
    },
    login: async (identity, password) => {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity, password }),
      });
      return handleResponse(res);
    },
  },
  posts: {
    getFeed: async () => {
      const res = await fetch(`${BASE_URL}/posts`, {
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    getFollowingFeed: async () => {
      const res = await fetch(`${BASE_URL}/posts/following`, {
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    getUserPosts: async (userId) => {
      const res = await fetch(`${BASE_URL}/posts/user/${userId}`, {
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    createPost: async (text, mediaUrl = null, mediaType = null) => {
      const res = await fetch(`${BASE_URL}/posts`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ text, mediaUrl, mediaType }),
      });
      return handleResponse(res);
    },
    repostPost: async (postId) => {
      const res = await fetch(`${BASE_URL}/posts/${postId}/repost`, {
        method: 'POST',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    updatePost: async (postId, text, mediaUrl = null, mediaType = null) => {
      const res = await fetch(`${BASE_URL}/posts/${postId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ text, mediaUrl, mediaType }),
      });
      return handleResponse(res);
    },
    deletePost: async (postId) => {
      const res = await fetch(`${BASE_URL}/posts/${postId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
  },
  comments: {
    getComments: async (postId) => {
      const res = await fetch(`${BASE_URL}/comments/post/${postId}`, {
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    addComment: async (postId, text) => {
      const res = await fetch(`${BASE_URL}/comments/post/${postId}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ text }),
      });
      return handleResponse(res);
    },
    updateComment: async (commentId, text) => {
      const res = await fetch(`${BASE_URL}/comments/${commentId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ text }),
      });
      return handleResponse(res);
    },
    deleteComment: async (commentId) => {
      const res = await fetch(`${BASE_URL}/comments/${commentId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
  },
  likes: {
    getLikes: async (postId) => {
      const res = await fetch(`${BASE_URL}/likes/post/${postId}`, {
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    toggleLike: async (postId) => {
      const res = await fetch(`${BASE_URL}/likes/post/${postId}`, {
        method: 'POST',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
  },
  notifications: {
    getNotifications: async () => {
      const res = await fetch(`${BASE_URL}/notifications`, {
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    markAsRead: async () => {
      const res = await fetch(`${BASE_URL}/notifications/read`, {
        method: 'PUT',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
  },
  users: {
    getMe: async () => {
      const res = await fetch(`${BASE_URL}/users/me`, {
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    getUser: async (userId) => {
      const res = await fetch(`${BASE_URL}/users/${userId}`, {
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    getUserByUsername: async (username) => {
      const res = await fetch(`${BASE_URL}/users/username/${username}`, {
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    searchUsers: async (query) => {
      const res = await fetch(`${BASE_URL}/users/search?q=${encodeURIComponent(query)}`, {
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    toggleFollow: async (userId) => {
      const res = await fetch(`${BASE_URL}/users/${userId}/follow`, {
        method: 'POST',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    getFollowers: async (userId) => {
      const res = await fetch(`${BASE_URL}/users/${userId}/followers`, {
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    getFollowing: async (userId) => {
      const res = await fetch(`${BASE_URL}/users/${userId}/following`, {
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    updateProfile: async (data) => {
      const res = await fetch(`${BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },
  },
};
