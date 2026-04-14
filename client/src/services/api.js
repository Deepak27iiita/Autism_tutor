import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const parseError = (error, fallbackMessage = "Something went wrong") => {
  const validationErrors = error?.response?.data?.errors;
  if (Array.isArray(validationErrors) && validationErrors.length > 0) {
    return validationErrors.map((item) => item.msg).join(", ");
  }
  return error?.response?.data?.message || error?.message || fallbackMessage;
};

const authApi = {
  login: async (payload) => {
    const { data } = await api.post("/auth/login", payload);
    return data;
  },
  register: async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    return data;
  },
  me: async () => {
    const { data } = await api.get("/auth/me");
    return data;
  },
};

const wordsApi = {
  list: async (params = {}) => {
    const { data } = await api.get("/words", { params });
    return data;
  },
  create: async (payload) => {
    const { data } = await api.post("/words", payload);
    return data;
  },
  update: async (id, payload) => {
    const { data } = await api.put(`/words/${id}`, payload);
    return data;
  },
  remove: async (id) => {
    const { data } = await api.delete(`/words/${id}`);
    return data;
  },
};

const sessionApi = {
  create: async (payload) => {
    const { data } = await api.post("/sessions", payload);
    return data;
  },
  list: async () => {
    const { data } = await api.get("/sessions");
    return data;
  },
  addResult: async (id, payload) => {
    const { data } = await api.put(`/sessions/${id}/results`, payload);
    return data;
  },
  complete: async (id, payload) => {
    const { data } = await api.put(`/sessions/${id}/complete`, payload);
    return data;
  },
};

const usersApi = {
  updatePreferences: async (userId, payload) => {
    const { data } = await api.put(`/users/${userId}/preferences`, payload);
    return data;
  },
};

const analyticsApi = {
  getByUser: async (userId) => {
    const { data } = await api.get(`/analytics/${userId}`);
    return data;
  },
  create: async (payload) => {
    const { data } = await api.post("/analytics", payload);
    return data;
  },
};

export {
  api,
  parseError,
  authApi,
  wordsApi,
  sessionApi,
  usersApi,
  analyticsApi,
};
