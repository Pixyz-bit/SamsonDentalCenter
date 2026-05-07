const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

/**
 * Shared fetch wrapper.
 * All hooks use this â€” if the base URL or auth header format changes,
 * you only change this one file.
 */
const request = async (method, path, { body = null, token = null, keepalive = false } = {}) => {
    const headers = {};

    if (body) {
        headers['Content-Type'] = 'application/json';
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null,
        keepalive,
    });

    const data = await res.json();

    if (!res.ok) {
        // Handle Global Session Timeout (401)
        if (res.status === 401 && !path.includes('/auth/login')) {
            sessionStorage.setItem('session_timeout', 'true');
            localStorage.removeItem('token');
            window.location.href = '/login';
            return;
        }

        // Throw a structured error that components can catch
        const error = new Error(data.error || 'Something went wrong');
        error.status = res.status;
        error.data = data;
        throw error;
    }

    return data;
};

export const api = {
    get: (path, token) => request('GET', path, { token }),
    post: (path, body, token, keepalive = false) => request('POST', path, { body, token, keepalive }),
    patch: (path, body, token) => request('PATCH', path, { body, token }),
    put: (path, body, token) => request('PUT', path, { body, token }),
    delete: (path, token) => request('DELETE', path, { token }),
};




