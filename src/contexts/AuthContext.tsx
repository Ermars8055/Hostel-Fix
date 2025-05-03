import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

type User = {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'boys' | 'girls';
  hostelName?: string;
  roomNumber?: string;
};

type AuthResponse = {
  token: string;
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'boys' | 'girls';
  hostelName?: string;
  roomNumber?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
};

type RegisterData = {
  name: string;
  email: string;
  password: string;
  role: 'boys' | 'girls';
  hostelName: string;
  roomNumber: string;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:1000/api',
  withCredentials: true
});

// Add request interceptor to include token in headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export { api };

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Add response interceptor to handle 401 errors
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Clear token and user data
          localStorage.removeItem('token');
          setUser(null);
          setIsAuthenticated(false);
          // Redirect to login page
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await api.get('/auth/me');
        setUser(response.data);
        setIsAuthenticated(true);
      } catch (error) {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post<AuthResponse>('/auth/login', { email, password });
      const { token, ...userData } = response.data;
      
      // Store token in localStorage
      localStorage.setItem('token', token);
      
      setUser(userData as User);
      setIsAuthenticated(true);
      toast.success('Login successful');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
      toast.error(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post<AuthResponse>('/auth/register', userData);
      const { token, ...rest } = response.data;
      
      // Store token in localStorage
      localStorage.setItem('token', token);
      
      setUser(rest as User);
      setIsAuthenticated(true);
      toast.success('Registration successful');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
      toast.error(err.response?.data?.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.get('/auth/logout');
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('token');
      toast.success('Logged out successfully');
    } catch (err: any) {
      toast.error('Logout failed');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        isAuthenticated
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};