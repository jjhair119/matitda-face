import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Reactotron from '../config/reactotron';

const TOKEN_KEY = '@matitda_token';

export const saveToken = (token: string) => AsyncStorage.setItem(TOKEN_KEY, token);
export const getToken = () => AsyncStorage.getItem(TOKEN_KEY);
export const removeToken = () => AsyncStorage.removeItem(TOKEN_KEY);

export const api = axios.create({
    baseURL: 'https://matasitda-backend-production.up.railway.app',
    timeout: 10000,
});

api.interceptors.request.use(async (config) => {
    const token = await getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (res) => res,
    (error) => {
        if (error.response?.status === 401) {
            removeToken();
        }
        return Promise.reject(error);
    },
);

// Reactotron network logging (dev only)
if (__DEV__) {
    api.interceptors.request.use((config) => {
        Reactotron.display?.({
            name: `→ ${config.method?.toUpperCase()} ${config.url}`,
            value: {headers: config.headers, data: config.data},
            preview: `${config.method?.toUpperCase()} ${config.url}`,
        });
        return config;
    });

    api.interceptors.response.use(
        (res) => {
            Reactotron.display?.({
                name: `← ${res.status} ${res.config.url}`,
                value: res.data,
                preview: `${res.status} ${res.config.url}`,
                important: false,
            });
            return res;
        },
        (error) => {
            Reactotron.display?.({
                name: `✗ ${error.response?.status ?? 'ERR'} ${error.config?.url}`,
                value: error.response?.data ?? error.message,
                preview: `${error.response?.status ?? 'ERR'} ${error.config?.url}`,
                important: true,
            });
            return Promise.reject(error);
        },
    );
}
