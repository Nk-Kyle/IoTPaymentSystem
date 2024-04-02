"use client";

import { signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

const TransactionHistory = () => {
    const [userInfo, setUserInfo] = useState(null);

    const { data: session } = useSession();

    useEffect(() => {
        // Fetch user info
        const fetchUserInfo = async () => {
            const res = await fetch(
                process.env.NEXT_PUBLIC_BACKEND_URL +
                    "/api/info/?uid=" +
                    session?.user?.email,
                {
                    method: "GET",
                }
            );

            if (res.status === 200) {
                const data = await res.json();
                setUserInfo(data);
            }
        };

        if (session) {
            fetchUserInfo();
        }
    }, [session]); // Add session as a dependency

    useEffect(() => {
        const snapScript = "https://app.sandbox.midtrans.com/snap/snap.js";
        const clientKey = process.env.NEXT_PUBLIC_CLIENT;
        const script = document.createElement("script");

        script.src = snapScript;
        script.setAttribute("data-client-key", clientKey);
        script.async = true;

        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const handleTopUp = (amount) => {
        const data = {
            id: userInfo?.nim + Date.now(),
            amount: amount,
        };

        fetch(process.env.NEXT_PUBLIC_NGROK_URL + "/api/tokenizer", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })
            .then((res) => res.json())
            .then((data_json) => {
                const { token } = data_json;
                window.snap.pay(token, {
                    onSuccess: function (result) {
                        // Post to backend
                        fetch(
                            process.env.NEXT_PUBLIC_BACKEND_URL + "/api/topup/",
                            {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify({
                                    uid: session?.user?.email,
                                    amount: data.amount,
                                }),
                            }
                        );
                    },
                });
            });
    };

    const handleLogout = () => {
        signOut();
    };

    return (
        <div className="container mx-auto p-4 relative">
            <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline absolute top-4 right-4 transition duration-300 ease-in-out transform hover:scale-105" // Added styles for transition and hover effect
            >
                Logout
            </button>

            <h1 className="text-3xl font-bold mb-4 text-center">
                Transaction History
            </h1>

            <div className="mb-8">
                <p className="text-2xl font-semibold text-center">
                    Welcome, {userInfo?.nim}
                </p>
                <p className="text-2xl font-semibold text-center">
                    Balance: IDR {userInfo?.balance}
                </p>
            </div>

            <div className="flex justify-center mb-4">
                <button
                    onClick={() => handleTopUp(20000)}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 ease-in-out transform hover:scale-105" // Added styles for transition and hover effect
                >
                    Top-Up 20k
                </button>
                <button
                    onClick={() => handleTopUp(50000)}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 ease-in-out transform hover:scale-105 ml-4" // Added styles for transition and hover effect
                >
                    Top-Up 50k
                </button>
                <button
                    onClick={() => handleTopUp(100000)}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 ease-in-out transform hover:scale-105 ml-4" // Added styles for transition and hover effect
                >
                    Top-Up 100k
                </button>
            </div>

            <div className="border border-gray-300 rounded-lg p-4">
                <ul className="space-y-4">
                    {userInfo?.history?.map((transaction, index) => (
                        <li
                            key={index}
                            className="flex justify-between items-center border-b border-gray-300 pb-2"
                        >
                            <div className="flex flex-col">
                                <p className="font-semibold">
                                    {transaction.time}
                                </p>
                                <p
                                    className={
                                        transaction.amount > 0
                                            ? "text-green-600"
                                            : "text-red-600"
                                    }
                                >
                                    IDR {transaction.amount}
                                </p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default TransactionHistory;
