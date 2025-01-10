// src/middleware.ts (or root `middleware.ts` if you prefer)
import { withAuth } from 'next-auth/middleware';

export default withAuth({
    pages: {
        signIn: '/auth/login', // Redirect here if not logged in
    },
});

export const config = {
    matcher: ['/profile', '/dashboard', '/newsfeed', '/services', '/events', '/marketplace', '/profile'], // Specify all protected routes
};