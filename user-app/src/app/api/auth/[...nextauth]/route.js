import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {},

            async authorize(credentials) {
                const { nim, password } = credentials;

                // Fetch user from backend
                let user = { email: nim, password: password };

                const res = await fetch(
                    process.env.NEXT_PUBLIC_BACKEND_URL + "/api/auth/login/",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            uid: nim,
                            password,
                        }),
                    }
                );

                if (res.status !== 200) {
                    throw new Error("Invalid credentials");
                }

                // Return user object
                return user;
            },
        }),
    ],
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: "/",
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
