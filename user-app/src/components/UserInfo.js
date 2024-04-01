"use client";

const TransactionHistory = () => {
    // Dummy transaction data
    const transactions = [
        { id: 1, description: "Payment received", amount: 100 },
        { id: 2, description: "Grocery shopping", amount: -50 },
        { id: 3, description: "Online purchase", amount: -30 },
    ];

    // Calculate balance
    const balance = transactions.reduce(
        (total, transaction) => total + transaction.amount,
        0
    );

    const handleTopUp = () => {
        // Implement your top-up logic here
        console.log("Top-up button clicked");
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-4 text-center">
                Transaction History
            </h1>

            <div className="mb-8">
                <p className="text-2xl font-semibold text-center">
                    Balance: ${balance}
                </p>
            </div>

            <div className="flex justify-center mb-4">
                <button
                    onClick={handleTopUp}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                    Top-Up
                </button>
            </div>

            <div className="border border-gray-300 rounded-lg p-4">
                <ul className="space-y-4">
                    {transactions.map((transaction) => (
                        <li
                            key={transaction.id}
                            className="flex justify-between items-center border-b border-gray-300 pb-2"
                        >
                            <div className="flex flex-col">
                                <p className="font-semibold">
                                    {transaction.description}
                                </p>
                                <p
                                    className={
                                        transaction.amount > 0
                                            ? "text-green-600"
                                            : "text-red-600"
                                    }
                                >
                                    ${transaction.amount}
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
