@tailwind base;
@tailwind components;
@tailwind utilities;

/* No dark background; let Tailwind's default or overridden classes handle it */
.square-card {
    border-radius: 0; /* Example custom override */
}

/* Override or add your custom light-theme styles here. */
html,
body {
    padding: 0;
    margin: 0;
    font-family: "Poppins", sans-serif;
}

html {
    background-color: #ffffff;
    color-scheme: light;
    --brand-color: #00FFFC;
    --support-border: #2D2D2D;
}

html.dark {
    background-color: #181818;
    color-scheme: dark;
    color: #ffffff;
    --support-border: #2D2D2D;
}

html.dark body {
    background-color: #181818;
    color: #ffffff;
}

html.dark input,
html.dark textarea,
html.dark select {
    background-color: #1E1E1E;
    color: #AFAFAF;
}

html.dark .bg-white {
    background-color: #212121 !important;
}

html.dark .text-black {
    color: #ffffff !important;
}

html.dark .text-gray-700,
html.dark .text-gray-800,
html.dark .text-gray-900 {
    color: #ffffff !important;
}

/* Minimal fade-in-up animation for sidebars */
@keyframes fadeInUp {
    0% {
        opacity: 0;
        transform: translateY(20px);
    }
    100% {
        opacity: 1;
        transform: translateY(0);
    }
}
div {
    padding: 0;
    margin: 0;
}
/* Utility class for the fade-in animation */
.fade-in-up {
    animation: fadeInUp 0.4s cubic-bezier(0.25, 1, 0.5, 1) forwards;
}

/* Enhanced hover states for a modern Tesla-like approach */
.tesla-hover:hover {
    background: rgba(0, 0, 0, 0.04); /* Subtle gray overlay on hover */
    transform: scale(1.02);          /* Slight scale up */
}

/* Extra-smooth transitions */
.transition-smooth {
    transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
}

/* Skeleton placeholder */
@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
}

.animate-pulse div {
    animation: pulse 1.5s ease-in-out infinite;
}
