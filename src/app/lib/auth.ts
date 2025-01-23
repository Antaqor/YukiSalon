// File: /app/lib/auth.ts

/** 1) Define your AuthUser type (or import from your context if it’s the same) */
export interface AuthUser {
    id: string;
    username: string;
    email?: string;
    role?: string;
    accessToken?: string;
    // ... add other fields if needed
}

/**
 * 2) saveToken: store the token as a string
 */
export function saveToken(token: string): void {
    localStorage.setItem("token", token);
}

/**
 * 3) getToken: retrieve the token or null
 */
export function getToken(): string | null {
    return localStorage.getItem("token");
}

/**
 * 4) saveUser: store user in localStorage as JSON, typed as AuthUser
 */
export function saveUser(userObj: AuthUser): void {
    localStorage.setItem("user", JSON.stringify(userObj));
}

/**
 * 5) getUser: parse user from localStorage, returning AuthUser or null
 */
export function getUser(): AuthUser | null {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;

    try {
        const parsed = JSON.parse(userStr) as AuthUser;
        return parsed;
    } catch {
        return null;
    }
}

/**
 * 6) logout: remove token and user keys
 */
export function logout(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
}
