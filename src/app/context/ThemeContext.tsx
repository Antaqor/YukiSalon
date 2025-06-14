"use client";
import { createContext, useContext, useEffect, useState } from "react";

export type Theme = "light";

interface ThemeState {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeState>({
    theme: "light",
    toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        document.documentElement.classList.remove("dark");
        document.documentElement.classList.add("light");
    }, []);

    const toggleTheme = () => {};
    return (
        <ThemeContext.Provider value={{ theme: "light", toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
