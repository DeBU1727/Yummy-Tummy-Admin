import axios from 'axios';
import { API_BASE_URL, MAIN_APP_URL } from './config';

const api = axios.create({
    baseURL: `${API_BASE_URL}/api`,
});

// Request interceptor to include the token in headers
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handle 403/401
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const url = error.config && error.config.url ? error.config.url : '';
        const isAuthPath = url.includes('/auth/') || url.includes('/otp/') || url.includes('/login');

        if (!isAuthPath && error.response && (error.response.status === 401 || error.response.status === 403)) {
            console.warn("Unauthorized. Redirecting to main login...");
            window.location.href = `${MAIN_APP_URL}/login`;
        }
        return Promise.reject(error);
    }
);

export default api;
