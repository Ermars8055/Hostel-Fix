import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

type User = {
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

// Demo users
const DEMO_USERS = {
  admin: {
    _id: '1',
    name: 'Admin User',
    email: 'admin@demo.com',
    password: 'admin123',
    role: 'admin'
  },
  boys: {
    _id: '2',
    name: 'John Doe',
    email: 'boy@demo.com',
    password: 'student123',
    role: 'boys',
    hostelName: 'Boys Hostel 1',
    roomNumber: 'B101'
  },
  girls: {
    _id: '3',
    name: 'Jane Smith',
    email: 'girl@demo.com',
    password: 'student123',
    role: 'girls',
    hostelName: 'Girls Hostel 1',
    roomNumber: 'G101'
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if token exists
    const token = localStorage.getItem('token');
    if (token) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Find matching demo user
      const demoUser = Object.values(DEMO_USERS).find(
        u => u.email === email && u.password === password
      );
      
      if (!demoUser) {
        throw new Error('Invalid credentials');
      }
      
      // Remove password from user object
      const { password: _, ...userWithoutPassword } = demoUser;
      
      // Generate a simple demo token
      const token = `demo_token_${demoUser._id}_${Date.now()}`;
      
      // Store token and user in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      
      setUser(userWithoutPassword as User);
      setIsAuthenticated(true);
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw new Error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Create new user object
      const newUser = {
        _id: Date.now().toString(),
        name: userData.name,
        email: userData.email,
        role: userData.role,
        hostelName: userData.hostelName,
        roomNumber: userData.roomNumber
      };
      
      // Generate a simple demo token
      const token = `demo_token_${newUser._id}_${Date.now()}`;
      
      // Store token and user in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      setUser(newUser);
      setIsAuthenticated(true);
    } catch (err: any) {
      setError('Registration failed');
      throw new Error('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
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