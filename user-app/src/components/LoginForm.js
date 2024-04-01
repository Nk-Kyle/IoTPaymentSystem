"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
    const [nim, setNim] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await signIn("credentials", {
                nim,
                password,
                redirect: false,
            });

            if (res.error) {
                setError("Invalid Credentials");
                return;
            }

            router.replace("dashboard");
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100 ">
            <div className="bg-white p-8 rounded-lg shadow-md shadow-lg p-5 rounded-lg border-t-4 border-blue-400">
                <h1 className="text-2xl font-bold mb-6">Welcome Back!</h1>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label
                            htmlFor="nim"
                            className="block mb-2 text-sm font-medium text-gray-900"
                        >
                            Your ID
                        </label>
                        <input
                            onChange={(e) => setNim(e.target.value)}
                            type="text"
                            placeholder="13520XXX"
                            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-400"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="block mb-2 text-sm font-medium text-gray-900 "
                        >
                            Your password
                        </label>
                        <input
                            onChange={(e) => setPassword(e.target.value)}
                            type="password"
                            placeholder="Password"
                            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-400"
                        />
                    </div>

                    <button className="bg-blue-500 text-white font-semibold py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:bg-blue-600 transition duration-300 ease-in-out">
                        Login
                    </button>
                    {error && (
                        <div className="text-red-600 text-sm">{error}</div>
                    )}
                </form>
            </div>
        </div>
    );
}
