import { DefaultSession } from "next-auth";

declare module "next-auth" {
    /**
     * Extend the built-in session types.
     */
    interface Session {
        // By default, "user" on Session has an email, name, and image —
        // we can extend it or overwrite it with our own properties:
        user: DefaultSession["user"] & {
            id: string;
            username: string;
            email: string;
            role: string;
            accessToken?: string;
            image?: string; // ensure this is included
        };
    }

    /**
     * Extend the built-in user types.
     */
    interface User {
        id: string;
        username: string;
        email: string;
        role: string;
        accessToken?: string;
        image?: string; // make sure it's here, too
    }
}

// If you’re dealing with JWTs as well, do the same in next-auth/jwt:
declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        username: string;
        email: string;
        role: string;
        accessToken?: string;
        image?: string; // add this if you need it in the token
    }
}
