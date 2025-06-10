"use client";
import { createContext, useContext, useEffect, useState } from "react";

export type Theme = "dark";

interface ThemeState {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeState>({
    theme: "dark",
    toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        document.documentElement.classList.add("dark");
    }, []);

    const toggleTheme = () => {};
    return (
        <ThemeContext.Provider value={{ theme: "dark", toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
