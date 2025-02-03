import api from './api';

export interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
}

export interface CreateUserData {
    name: string;
    email: string;
    password: string;
    role: string;
}

export const getUsers = async () => {
    const response = await api.get<User[]>('/users');
    return response.data;
};

export const createUser = async (userData: CreateUserData) => {
    const response = await api.post<User>('/users', userData);
    return response.data;
};

export const updateUser = async (id: string, userData: Omit<CreateUserData, 'password'>) => {
    const response = await api.patch<User>(`/users/${id}`, userData);
    return response.data;
};

export const toggleUserStatus = async (userId: string, isActive: boolean) => {
    const response = await api.patch(`/users/${userId}/status`, { isActive });
    return response.data;
}; 