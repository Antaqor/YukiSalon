// File: /app/context/AuthContext.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getToken, getUser, logout as doLogout, saveToken, saveUser } from "../lib/auth";

/**
 * 1) Define an interface for the shape of "user".
 *    Adjust fields as needed based on your actual user data.
 */
interface AuthUser {
    id: string;
    username: string;
    email?: string;
    role?: string;
    accessToken?: string;
    // ... any other fields you may have
}

interface AuthState {
    user: AuthUser | null;
    loggedIn: boolean;
    login: (newUser: AuthUser, token: string) => void;
    logout: () => void;
}

/**
 * 2) Provide a default context value:
 */
const AuthContext = createContext<AuthState>({
    user: null,
    loggedIn: false,
    login: () => {},
    logout: () => {},
});

/**
 * 3) AuthProvider: store user in state as AuthUser | null
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loggedIn, setLoggedIn] = useState(false);

    useEffect(() => {
        const token = getToken();
        const storedUser = getUser(); // you might get an object that matches AuthUser
        if (token && storedUser) {
            setUser(storedUser);
            setLoggedIn(true);
        }
    }, []);

    /**
     * 4) login accepts an AuthUser & token
     */
    const login = (newUser: AuthUser, token: string) => {
        saveUser(newUser);
        saveToken(token);
        setUser(newUser);
        setLoggedIn(true);
    };

    const logout = () => {
        doLogout();
        setUser(null);
        setLoggedIn(false);
    };

    return (
        <AuthContext.Provider value={{ user, loggedIn, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

/**
 * 5) A custom hook to access the context:
 */
export function useAuth() {
    return useContext(AuthContext);
}
