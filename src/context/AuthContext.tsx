import { createContext, useContext, useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';
import api from "../lib/api";


type UserType = {
    name: string;
    email: string;
    role: string;
};

type AuthContextType = {
    user: UserType | null;
    access_token: string | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserType | null>(null);
    const [access_token, setToken] = useState<string | null>(null);
    // const [refresh_token, setRefresh_token] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const storedToken = localStorage.getItem('access_token');
        const storedUser = localStorage.getItem('user');
        if (storedToken && storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setToken(storedToken);
                setUser(parsedUser);
            } catch (error) {
                console.error('Erro ao carregar usuário:', error);
                localStorage.clear();
                setToken(null);
                setUser(null);
            }
        }
    }, []);

    const login = async (identifier: string, password: string) => {
        try {
            const response = await api.post(
                'http://127.0.0.1:8000/api/v1/auth/login',
                `username=${identifier}&password=${password}`,
                {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                },
            );

            const { access_token, refresh_token, user } = response.data;

            console.log('Login response:', response.data);

            setToken(access_token);
            // setRefresh_token(refresh_token);
            setUser(user);
            localStorage.setItem('access_token', access_token);
            localStorage.setItem('refresh_token', refresh_token);
            localStorage.setItem('user', JSON.stringify(user));
            navigate('/');
        } catch (error) {
            throw error;
        }
    };


    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.clear();
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ user, access_token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
