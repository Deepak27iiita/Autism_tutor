import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "/api";

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

// Auto-logout when server returns ACCOUNT_INACTIVE (deactivated mid-session)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error?.response?.status === 403 &&
      error?.response?.data?.code === "ACCOUNT_INACTIVE"
    ) {
      localStorage.removeItem("token");
      window.location.href = "/login?reason=inactive";
    }
    return Promise.reject(error);
  }
);

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
  recommended: async (limit = 5) => {
    const { data } = await api.get("/words/recommended", {
      params: { limit },
    });
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
  getMlInsights: async (userId) => {
    const { data } = await api.get(`/analytics/${userId}/ml-insights`);
    return data;
  },
  create: async (payload) => {
    const { data } = await api.post("/analytics", payload);
    return data;
  },
};

const adminApi = {
  listUsers: async (role) => {
    const { data } = await api.get("/admin/users", { params: role ? { role } : {} });
    return data;
  },
  updateRole: async (userId, role) => {
    const { data } = await api.put(`/admin/users/${userId}/role`, { role });
    return data;
  },
  toggleActive: async (userId, isActive) => {
    const { data } = await api.put(`/admin/users/${userId}/active`, { isActive });
    return data;
  },
  listAssignments: async () => {
    const { data } = await api.get("/admin/assignments");
    return data;
  },
  assign: async (teacherId, studentId) => {
    const { data } = await api.post("/admin/assign", { teacherId, studentId });
    return data;
  },
  unassign: async (assignmentId) => {
    const { data } = await api.delete(`/admin/assign/${assignmentId}`);
    return data;
  },
  getStats: async () => {
    const { data } = await api.get("/admin/stats");
    return data;
  },
};

const teacherApi = {
  getStudents: async () => {
    const { data } = await api.get("/teacher/students");
    return data;
  },
  getStudentProgress: async (studentId) => {
    const { data } = await api.get(`/teacher/students/${studentId}/progress`);
    return data;
  },
  updateNotes: async (studentId, notes) => {
    const { data } = await api.put(`/teacher/students/${studentId}/notes`, { notes });
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
  adminApi,
  teacherApi,
};
