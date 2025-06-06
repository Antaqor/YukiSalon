"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

interface Birthday {
    year: string;
    month: string;
    day: string;
}

export interface AuthUser {
    _id?: string;
    username?: string;
    name?: string;
    phoneNumber?: string;
    location?: string;
    gender?: string;
    birthday?: Birthday;
    profilePicture?: string;
    rating?: number;
    subscriptionExpiresAt?: string;
    following?: string[];
    followers?: string[];
    accessToken?: string;
}

interface AuthState {
    user: AuthUser | null;
    loggedIn: boolean;
    login: (u: AuthUser, t: string) => void;
    logout: () => void;
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
                // ignore parsing error
            }
        }
    }, []);

    const login = (newUser: AuthUser, token: string) => {
        const userWithSubscription = {
            ...newUser,
            subscriptionExpiresAt: newUser.subscriptionExpiresAt,
            accessToken: token,
        };
        localStorage.setItem("user", JSON.stringify(userWithSubscription));
        localStorage.setItem("token", token);
        setUser(userWithSubscription);
        setLoggedIn(true);
    };

    const logout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setUser(null);
        setLoggedIn(false);
    };

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
                updateSubscriptionExpiresAt,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
