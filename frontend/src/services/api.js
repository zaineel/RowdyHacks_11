import axios from "axios";

// Use production API URL
const API_URL =
  import.meta.env.VITE_API_URL || "https://api.crisiscopilot.tech/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Store for Auth0 token getter
let getAccessTokenSilently = null;

// Function to set the token getter from Auth0
export const setAuth0TokenGetter = (tokenGetter) => {
  getAccessTokenSilently = tokenGetter;
};

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    // Try to get Auth0 token if available
    if (getAccessTokenSilently) {
      try {
        const token = await getAccessTokenSilently();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error("Error getting access token:", error);
      }
    } else {
      // Fallback to localStorage
      const token = localStorage.getItem("auth_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem("auth_token");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default {
  // Auth
  auth: {
    register: (data) => api.post("/auth/register", data),
    getCurrentUser: () => api.get("/auth/me"),
    updateProfile: (data) => api.put("/auth/profile", data),
  },

  // Circles
  circles: {
    create: (data) => api.post("/circles", data),
    getById: (id) => api.get(`/circles/${id}`),
    join: (id, inviteCode) =>
      api.post(`/circles/${id}/join`, { invite_code: inviteCode }),
    joinByInviteCode: (inviteCode) =>
      api.post("/circles/join", { invite_code: inviteCode }),
    getMembers: (id) => api.get(`/circles/${id}/members`),
    update: (id, data) => api.put(`/circles/${id}`, data),
    delete: (id) => api.delete(`/circles/${id}`),
    getSchedule: (id) => api.get(`/circles/${id}/schedule`),
    approveMember: (id, userId) =>
      api.post(`/circles/${id}/approve-member`, { user_id: userId }),
    getPoolStatus: (id) => api.get(`/circles/${id}/pool-status`),
    getPayoutNotifications: () => api.get("/circles/notifications/payouts"),
  },

  // Payments
  payments: {
    make: (data) => api.post("/payments", data),
    getByCircle: (circleId) => api.get(`/payments/circle/${circleId}`),
    getByUser: (userId) => api.get(`/payments/user/${userId}`),
    getUpcoming: (userId) => api.get(`/payments/upcoming/${userId}`),
  },

  // Payouts
  payouts: {
    process: (data) => api.post("/payouts/process", data),
    getByCircle: (circleId) => api.get(`/payouts/circle/${circleId}`),
    getByUser: (userId) => api.get(`/payouts/user/${userId}`),
  },

  // Vouches
  vouches: {
    create: (data) => api.post("/vouches", data),
    getUserVouches: (circleId, userId) =>
      api.get(`/vouches/circle/${circleId}/user/${userId}`),
    getMyVouches: (circleId) =>
      api.get(`/vouches/circle/${circleId}/my-vouches`),
    revoke: (id) => api.delete(`/vouches/${id}`),
  },

  // Credit
  credit: {
    getScore: (userId) => api.get(`/credit/${userId}`),
    getHistory: (userId) => api.get(`/credit/${userId}/history`),
    getReport: (userId) => api.get(`/credit/${userId}/report`),
  },

  // AI
  ai: {
    assessRisk: (data) => api.post("/ai/assess-risk", data),
    detectFraud: (data) => api.post("/ai/detect-fraud", data),
    getRiskHistory: (userId) => api.get(`/ai/risk-history/${userId}`),
  },

  // Users
  users: {
    getById: (id) => api.get(`/users/${id}`),
    getCircles: (id) => api.get(`/users/${id}/circles`),
    getCreditHistory: (id) => api.get(`/users/${id}/credit-history`),
  },

  // Marketplace
  marketplace: {
    list: (filters) => api.get("/marketplace", { params: filters }),
    getById: (id) => api.get(`/marketplace/${id}`),
    create: (data) => api.post("/marketplace", data),
    update: (id, data) => api.put(`/marketplace/${id}`, data),
    delete: (id) => api.delete(`/marketplace/${id}`),
    myListings: () => api.get("/marketplace/my-listings"),
    myBorrows: () => api.get("/marketplace/my-borrows"),
    pendingRequests: () => api.get("/marketplace/pending-requests"),
    requestBorrow: (id, data) => api.post(`/marketplace/${id}/borrow`, data),
    approveBorrow: (borrowId) =>
      api.post(`/marketplace/borrows/${borrowId}/approve`),
    rejectBorrow: (borrowId) =>
      api.post(`/marketplace/borrows/${borrowId}/reject`),
    markReturned: (borrowId) =>
      api.post(`/marketplace/borrows/${borrowId}/return`),
    completeBorrow: (borrowId, data) =>
      api.post(`/marketplace/borrows/${borrowId}/complete`, data),
    // Payment methods
    processDeposit: (data) => api.post("/marketplace/payments/deposit", data),
    processRefund: (data) => api.post("/marketplace/payments/refund", data),
    getPaymentHistory: () => api.get("/marketplace/payments/history"),
    getPendingPayments: () => api.get("/marketplace/payments/pending"),
  },
};
