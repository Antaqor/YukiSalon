import { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: DefaultSession["user"] & {
            id: string;
            username: string;
            email: string;
            role: string;
            accessToken?: string;
            image?: string;
        };
    }

    interface User {
        id: string;
        username: string;
        email: string;
        role: string;
        accessToken?: string;
        image?: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        username: string;
        email: string;
        role: string;
        accessToken?: string;
        image?: string;
    }
}
