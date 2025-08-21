import React, { createContext, useContext, useReducer, useEffect } from 'react';

export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: {
    name: 'admin' | 'manager' | 'employee';
  } | string; // Handle both object format and string format
  created_at: string;
  updated_at: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean };

const storedToken = localStorage.getItem('token');

const initialState: AuthState = {
  user: null,
  token: storedToken,
  isLoading: false,
  isAuthenticated: false,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, isLoading: true };
    case 'LOGIN_SUCCESS':
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false,
        isAuthenticated: true,
      };
    case 'LOGIN_FAILURE':
      localStorage.removeItem('token');
      return { ...initialState, token: null };
    case 'LOGOUT':
      localStorage.removeItem('token');
      return { ...initialState, token: null };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
};

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

// Helper function to get role name safely
const getRoleName = (role: any): string => {
  if (typeof role === 'string') {
    return role;
  }
  if (role && typeof role === 'object' && role.name) {
    return role.name;
  }
  return 'employee'; // Default fallback
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = async (email: string, password: string) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      // Replace with your actual API endpoint
      const response = await fetch('http://127.0.0.1:8000/api/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      
      // For JWT tokens, the access token is in the 'access' field
      const token = data.access;
      const user = data.user || data;
      
      if (!token) {
        throw new Error('No token found in login response');
      }
      
      // After successful login, fetch the complete user profile to ensure we have all user data
      try {
        const profileResponse = await fetch('http://127.0.0.1:8000/api/auth/profile/', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (profileResponse.ok) {
          const completeUser = await profileResponse.json();
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { user: completeUser, token },
          });
        } else {
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { user, token },
          });
        }
      } catch (profileError) {
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user, token },
        });
      }
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE' });
      throw error;
    }
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          dispatch({ type: 'SET_LOADING', payload: true });
          // Replace with your actual API endpoint
          const response = await fetch('http://127.0.0.1:8000/api/auth/profile/', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const user = await response.json();
            dispatch({
              type: 'LOGIN_SUCCESS',
              payload: { user, token },
            });
          } else {
            dispatch({ type: 'LOGOUT' });
          }
        } catch (error) {
          dispatch({ type: 'LOGOUT' });
        } finally {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      }
    };

    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};