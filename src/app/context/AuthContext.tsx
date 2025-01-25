// app/context/AuthContext.tsx
"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

interface AuthUser {
    id?: string;
    username?: string;
    age?: number;
    mbti?: string; // New field
    accessToken?: string;
    subscriptionExpiresAt?: string;
}

interface AuthState {
    user: AuthUser | null;
    loggedIn: boolean;
    login: (u: AuthUser, t: string) => void;
    logout: () => void;

    // New function: update subscription expiration
    updateSubscriptionExpiresAt: (expires: string) => void;
}

const AuthContext = createContext<AuthState>({
    user: null,
    loggedIn: false,
    login: () => {},
    logout: () => {},
    updateSubscriptionExpiresAt: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loggedIn, setLoggedIn] = useState(false);

    useEffect(() => {
        const storedUserStr = localStorage.getItem("user");
        const token = localStorage.getItem("token");
        if (storedUserStr && token) {
            try {
                const parsed = JSON.parse(storedUserStr) as AuthUser;
                parsed.accessToken = token;
                setUser(parsed);
                setLoggedIn(true);
            } catch {
                // ignore
            }
        }
    }, []);

    const login = (newUser: AuthUser, token: string) => {
        localStorage.setItem("user", JSON.stringify(newUser));
        localStorage.setItem("token", token);
        setUser({ ...newUser, accessToken: token });
        setLoggedIn(true);
    };

    const logout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setUser(null);
        setLoggedIn(false);
    };

    // Update subscription expiration
    const updateSubscriptionExpiresAt = (expires: string) => {
        if (user) {
            const updated = { ...user, subscriptionExpiresAt: expires };
            setUser(updated);
            localStorage.setItem("user", JSON.stringify(updated));
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loggedIn,
                login,
                logout,
                updateSubscriptionExpiresAt
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
