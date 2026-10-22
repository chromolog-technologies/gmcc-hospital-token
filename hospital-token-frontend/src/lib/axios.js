import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'https://api.gmcchtsrtoken.com/api',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
});

// ── Client system info ───────────────────────────────────────────────────────
// Sent with every request so the backend activity log can record which
// device/system an admin logged in or acted from.
const buildDeviceInfo = () => {
    try {
        return encodeURIComponent(JSON.stringify({
            platform: navigator.userAgentData?.platform || navigator.platform || '',
            mobile:   navigator.userAgentData?.mobile ?? /Mobi/i.test(navigator.userAgent),
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            screen:   `${window.screen.width}x${window.screen.height}`,
            cpu_cores: navigator.hardwareConcurrency || null,
            memory_gb: navigator.deviceMemory || null,
        }));
    } catch {
        return '';
    }
};
const deviceInfoHeader = buildDeviceInfo();

// ── Request Interceptor ──────────────────────────────────────────────────────
// Automatically attaches the auth token to every request from sessionStorage.
// This ensures protected API calls work correctly even after a page refresh.
api.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        config.headers['X-Client-Platform'] = 'web';
        if (deviceInfoHeader) config.headers['X-Device-Info'] = deviceInfoHeader;
        return config;
    },
    (error) => Promise.reject(error)
);

// ── Response Interceptor ─────────────────────────────────────────────────────
// Handles 401 Unauthorized responses globally.
// If the server rejects the token (expired or invalid), the user is
// automatically logged out and redirected to the login page.
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear stale auth data
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('hospital');

            // Only redirect if not already on the login page
            if (!window.location.pathname.toLowerCase().includes('/adminlogin')) {
                window.location.href = '/Adminlogin';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
