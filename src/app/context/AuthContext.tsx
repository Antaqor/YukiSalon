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
    coverImage?: string;
    rating?: number;
    subscriptionExpiresAt?: string;
    vntBalance?: number;
    following?: string[];
    followers?: string[];
    accessToken?: string;
}

interface AuthState {
    user: AuthUser | null;
    loggedIn: boolean;
    loading: boolean;
    login: (u: AuthUser, t: string) => void;
    logout: () => void;
    updateSubscriptionExpiresAt: (expires: string) => void;
}

const AuthContext = createContext<AuthState>({
    user: null,
    loggedIn: false,
    loading: true,
    login: () => {},
    logout: () => {},
    updateSubscriptionExpiresAt: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loggedIn, setLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUserStr = localStorage.getItem("user");
        const token = localStorage.getItem("token");
        if (storedUserStr && token) {
            try {
                const parsed = JSON.parse(storedUserStr) as AuthUser;
                parsed.accessToken = token;
                if (typeof parsed.vntBalance === "string") {
                    parsed.vntBalance = Number(parsed.vntBalance);
                }
                setUser(parsed);
                setLoggedIn(true);
            } catch {
                // ignore parsing error
            }
        }
        setLoading(false);
    }, []);

    const login = (newUser: AuthUser, token: string) => {
        const userWithSubscription = {
            ...newUser,
            subscriptionExpiresAt: newUser.subscriptionExpiresAt,
            vntBalance:
                newUser.vntBalance !== undefined
                    ? newUser.vntBalance
                    : user?.vntBalance,
            accessToken: token,
        };
        localStorage.setItem("user", JSON.stringify(userWithSubscription));
        localStorage.setItem("token", token);
        document.cookie = `token=${token}; path=/`;
        setUser(userWithSubscription);
        setLoggedIn(true);
    };

    const logout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
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
                loading,
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
