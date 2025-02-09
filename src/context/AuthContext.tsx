import { createContext, useContext, useState, ReactNode } from 'react';
import config from '../config/config';

export interface AuthUser {
    _id: string;
    name: string;
    email: string;
    role: string;
}

interface AuthContextType {
    isAuthenticated: boolean;
    user: AuthUser | null;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

interface LoginResponse {
    access_token: string;
    user: {
        _id: string;
        name: string;
        email: string;
        role: string;
    };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        return !!(storedToken && storedUser);
    });

    const [user, setUser] = useState<AuthUser | null>(() => {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });

    const [token, setToken] = useState<string | null>(() => {
        return localStorage.getItem('token');
    });

    const login = async (email: string, password: string) => {
        try {
            const response = await fetch(`${config.API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                throw new Error('Credenciales inválidas');
            }

            const data: LoginResponse = await response.json();

            const userData: AuthUser = {
                _id: data.user._id,
                email: data.user.email,
                name: data.user.name,
                role: data.user.role
            };

            setToken(data.access_token);
            setUser(userData);
            setIsAuthenticated(true);

            localStorage.setItem('token', data.access_token);
            localStorage.setItem('user', JSON.stringify(userData));
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
} 