/**
 * API service for EcoCraft AI.
 * Communicates with FastAPI backend with structured error handling and offline fallbacks.
 */

const API_BASE = '/api';

export async function request(endpoint, options = {}) {
  const token = localStorage.getItem('ecocraft_token');
  const headers = {
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If body is not FormData, default to application/json
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    options.body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `Error: ${response.status} ${response.statusText}`;
    try {
      const errorJson = await response.json();
      if (errorJson.detail) errorMsg = errorJson.detail;
    } catch (e) {
      // fallback
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

// ==================== Craft Services ====================
export const getCrafts = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request(`/crafts${qs ? `?${qs}` : ''}`);
};

export const getCraftById = (id) => request(`/crafts/${id}`);
export const getCraftSteps = (id) => request(`/crafts/${id}/steps`);
export const getRecommendations = (data) => request('/recommendations', { method: 'POST', body: data });

// ==================== Scanner Services ====================
export const scanWasteImage = (formData) => {
  return request('/scan', {
    method: 'POST',
    body: formData,
  });
};

export const confirmScan = (data) => request('/scan/confirm', { method: 'POST', body: data });

// ==================== Progress & Gamification ====================
export const completeCraft = (childId, craftId, photoUrl = null) => {
  return request('/progress/complete', {
    method: 'POST',
    body: { child_id: childId, craft_id: craftId, photo_url: photoUrl },
  });
};

export const getChildProgress = (childId) => request(`/progress/${childId}`);
export const getChildBadges = (childId) => request(`/badges/${childId}`);
export const getCertificateData = (childId) => request(`/rewards/${childId}`);

// ==================== Learning & Quizzes ====================
export const getLessons = () => request('/lessons');
export const getLessonDetail = (id) => request(`/lessons/${id}`);
export const submitQuiz = (childId, lessonId, answers) => {
  return request('/quizzes/submit', {
    method: 'POST',
    body: { child_id: childId, lesson_id: lessonId, answers },
  });
};

// ==================== Child Profiles ====================
export const getChildren = () => request('/children');
export const getChildById = (id) => request(`/children/${id}`);
export const createChild = (data) => request('/children', { method: 'POST', body: data });
export const updateChild = (id, data) => request(`/children/${id}`, { method: 'PUT', body: data });

// ==================== Favorites ====================
export const toggleFavorite = (childId, craftId) => {
  return request(`/favorites?child_id=${childId}&craft_id=${craftId}`, { method: 'POST' });
};
export const getFavorites = (childId) => request(`/favorites/${childId}`);

// ==================== Auth ====================
export const loginUser = (email, password) => {
  return request('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
};

export const registerUser = (data) => request('/auth/register', { method: 'POST', body: data });
export const getCurrentUser = () => request('/auth/me');

// ==================== Portals ====================
export const getParentOverview = () => request('/portal/parent/overview');
export const getTeacherOverview = () => request('/portal/teacher/overview');
