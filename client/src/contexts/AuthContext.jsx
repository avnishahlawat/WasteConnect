import { createContext, useContext, useReducer, useEffect } from 'react';
const initialState = {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
};
const authReducer = (state, action) => {
    switch (action.type) {
        case 'SET_AUTH':
            return { ...state, user: action.payload.user, token: action.payload.token, isAuthenticated: true, isLoading: false };
        case 'LOGOUT':
            return { ...initialState, isLoading: false };
        case 'SET_LOADING':
            return { ...state, isLoading: action.payload };
        case 'UPDATE_USER':
            return { ...state, user: action.payload };
        default:
            return state;
    }
};
const AuthContext = createContext(undefined);
export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);
    useEffect(() => {
        const token = localStorage.getItem('wc_token');
        const userStr = localStorage.getItem('wc_user');
        if (token && userStr) {
            try {
                const user = JSON.parse(userStr);
                dispatch({ type: 'SET_AUTH', payload: { user, token } });
            }
            catch {
                localStorage.removeItem('wc_token');
                localStorage.removeItem('wc_user');
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        }
        else {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    }, []);
    const login = (user, token) => {
        localStorage.setItem('wc_token', token);
        localStorage.setItem('wc_user', JSON.stringify(user));
        dispatch({ type: 'SET_AUTH', payload: { user, token } });
    };
    const logout = () => {
        localStorage.removeItem('wc_token');
        localStorage.removeItem('wc_user');
        dispatch({ type: 'LOGOUT' });
    };
    const updateUser = (user) => {
        localStorage.setItem('wc_user', JSON.stringify(user));
        dispatch({ type: 'UPDATE_USER', payload: user });
    };
    return (<AuthContext.Provider value={{ ...state, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>);
};
export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx)
        throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
