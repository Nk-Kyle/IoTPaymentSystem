"use client";

import { useRouter } from "next/navigation";

export default function Thanks() {
    const router = useRouter();

    const handleRedirect = () => {
        router.push("/dashboard");
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-3xl font-bold mb-4">
                Thank you for your purchase!
            </h1>
            <p className="text-lg mb-6">
                Your order has been placed successfully.
            </p>
            <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                onClick={handleRedirect}
            >
                Go to Dashboard
            </button>
        </div>
    );
}