import "./globals.css";
import { Inter } from "next/font/google";
import { AuthProvider } from "./Provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
    title: "User App - V1",
    description: "A simple user dashboard",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <AuthProvider>{children}</AuthProvider>
            </body>
        </html>
    );
}
