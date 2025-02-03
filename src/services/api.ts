import axios from 'axios';
import config from '../config/config';

const api = axios.create({
    baseURL: config.API_URL
});

// Interceptor para agregar el token a todas las peticiones
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api; 