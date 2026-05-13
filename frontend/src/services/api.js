/**
 * API Service
 * Handles all communication with the backend.
 *
 * In dev: VITE_API_URL is empty, so requests go to /api/... and are proxied
 * by Vite to the local backend (see vite.config.js).
 *
 * In production: set VITE_API_URL to the deployed backend origin, e.g.
 * VITE_API_URL=https://instavs-backend.up.railway.app
 */

const API_BASE = (import.meta.env.VITE_API_URL || '') + '/api';

/**
 * Helper to handle fetch requests
 */
async function fetchAPI(endpoint, options = {}) {
  try {
    const url = `${API_BASE}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error.message);
    throw error;
  }
}

// ============================================
// AUTH & CONNECTION APIs
// ============================================

export async function initiateInstagramOAuth() {
  return await fetchAPI('/auth/instagram');
}

export async function getConnectionStatus() {
  return await fetchAPI('/auth/instagram/status');
}

export async function disconnectInstagram() {
  return await fetchAPI('/auth/instagram/disconnect', {
    method: 'POST'
  });
}

// ============================================
// RULES APIs
// ============================================

export async function getRules() {
  return await fetchAPI('/rules');
}

export async function createRule(ruleData) {
  return await fetchAPI('/rules', {
    method: 'POST',
    body: JSON.stringify(ruleData)
  });
}

export async function updateRule(id, ruleData) {
  return await fetchAPI(`/rules/${id}`, {
    method: 'PUT',
    body: JSON.stringify(ruleData)
  });
}

export async function deleteRule(id) {
  return await fetchAPI(`/rules/${id}`, {
    method: 'DELETE'
  });
}

export async function toggleRule(id) {
  return await fetchAPI(`/rules/${id}/toggle`, {
    method: 'PATCH'
  });
}

// ============================================
// MESSAGES APIs
// ============================================

export async function getMessages(type = null) {
  const query = type ? `?type=${type}` : '';
  return await fetchAPI(`/messages${query}`);
}

export async function getMessageStats() {
  return await fetchAPI('/messages/stats');
}

export async function getHealth() {
  return await fetchAPI('/health');
}
