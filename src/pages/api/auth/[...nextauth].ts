import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                try {
                    // Hardcode the IP for login:
                    const res = await axios.post("http://68.183.191.149/api/auth/login", {
                        username: credentials?.username,
                        password: credentials?.password
                    });
                    if (res.status === 200 && res.data.token) {
                        const user = res.data.user;
                        user.accessToken = res.data.token;
                        return user;
                    }
                    return null;
                } catch (err) {
                    console.error("Login error:", err);
                    return null;
                }
            }
        })
    ],
    secret: process.env.NEXTAUTH_SECRET || "MYSECRET",
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.username = user.username;
                token.email = user.email;
                token.role = user.role;
                token.accessToken = user.accessToken;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.username = token.username as string;
                session.user.email = token.email as string;
                session.user.role = token.role as string;
                session.user.accessToken = token.accessToken as string;
            }
            return session;
        }
    },
    pages: {
        signIn: "/auth/login",
        error: "/auth/login"
    },
    debug: true
};

export default NextAuth(authOptions);
