'use client';

import { useState, useEffect, useRef } from 'react';

export default function Page() {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom of messages
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        // Add user message to chat
        const userMessage = { text: inputValue, sender: 'user' };
        setMessages((prev) => [...prev, userMessage]);
        setIsLoading(true);
        setInputValue('');

        try {
            // Send request to AI endpoint
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const response = await fetch(`${apiUrl}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: userMessage.text }),
            });

            if (!response.ok) {
                throw new Error('Failed to get response');
            }

            const data = await response.json();

            // Extract the message content from the response
            let messageText;
            if (typeof data === 'string') {
                messageText = data;
            } else if (typeof data === 'object') {
                // Check for common response formats
                if (data.message) {
                    messageText = data.message;
                } else if (data.text) {
                    messageText = data.text;
                } else if (data.content) {
                    messageText = data.content;
                } else if (data.response) {
                    messageText = data.response;
                } else {
                    // Fallback if we can't identify a specific field
                    messageText = JSON.stringify(data);
                }
            } else {
                messageText = String(data);
            }

            // Add AI response to chat
            setMessages((prev) => [
                ...prev,
                {
                    text: messageText,
                    sender: 'ai',
                },
            ]);
        } catch (error) {
            console.error('Error:', error);
            setMessages((prev) => [
                ...prev,
                {
                    text: "Sorry, I couldn't connect to the server. Please try again later.",
                    sender: 'ai',
                    error: true,
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50" data-oid="5te:qzg">
            {/* Header */}
            <header className="bg-indigo-600 text-white p-4 shadow-md" data-oid="l2q71oy">
                <div
                    className="max-w-4xl mx-auto flex justify-between items-center"
                    data-oid="fu0sgef"
                >
                    <h1 className="text-2xl font-bold" data-oid="n_sj91k">
                        Max Gaspers Scott AI Chat
                    </h1>
                    <p className="text-indigo-200" data-oid="e6zdonh">
                        Ask anything about Max
                    </p>
                </div>
            </header>

            {/* Main content */}
            <main
                className="flex-grow max-w-4xl w-full mx-auto p-4 flex flex-col"
                data-oid="x_r83:g"
            >
                {/* Welcome message */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6" data-oid="u8nsqnn">
                    <h2 className="text-xl font-semibold text-indigo-700 mb-2" data-oid="wgciynl">
                        Welcome to Max Gaspers Scott AI Assistant
                    </h2>
                    <p className="text-gray-600" data-oid="54222e.">
                        Ask me any questions about Max Gaspers Scott and I&apos;ll provide you with
                        information. Try questions about his background, work, or interests!
                    </p>
                </div>

                {/* Chat container */}
                <div
                    className="flex-grow bg-white rounded-lg shadow-md p-4 mb-4 overflow-y-auto"
                    data-oid="6ex_2d1"
                >
                    <div
                        className="space-y-4 min-h-[300px] max-h-[500px] overflow-y-auto"
                        data-oid="n6egv0w"
                    >
                        {messages.length === 0 ? (
                            <div className="text-center text-gray-400 mt-20" data-oid="1of.s9z">
                                <p data-oid="6r8z52-">No messages yet. Start the conversation!</p>
                            </div>
                        ) : (
                            messages.map((message, index) => (
                                <div
                                    key={index}
                                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                    data-oid="4sck8l6"
                                >
                                    <div
                                        className={`max-w-[80%] rounded-lg p-3 ${
                                            message.sender === 'user'
                                                ? 'bg-indigo-500 text-white rounded-br-none'
                                                : message.error
                                                  ? 'bg-red-100 text-red-700 rounded-bl-none'
                                                  : 'bg-gray-100 text-gray-800 rounded-bl-none'
                                        }`}
                                        data-oid="ddipwh-"
                                    >
                                        {message.text}
                                    </div>
                                </div>
                            ))
                        )}
                        {isLoading && (
                            <div className="flex justify-start" data-oid="1p.38g.">
                                <div
                                    className="bg-gray-100 rounded-lg p-3 rounded-bl-none"
                                    data-oid="0n23:td"
                                >
                                    <div className="flex space-x-2" data-oid="6uf9-z6">
                                        <div
                                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                            data-oid="mf8msrh"
                                        ></div>
                                        <div
                                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                            style={{ animationDelay: '0.2s' }}
                                            data-oid="knhgrxb"
                                        ></div>
                                        <div
                                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                            style={{ animationDelay: '0.4s' }}
                                            data-oid="6uxnt47"
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} data-oid="rwbk_v8" />
                    </div>
                </div>

                {/* Input form */}
                <form onSubmit={handleSubmit} className="flex gap-2" data-oid="xjc.wxb">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Ask something about Max Gaspers Scott..."
                        className="flex-grow p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        data-oid="15i896o"
                    />

                    <button
                        type="submit"
                        disabled={isLoading || !inputValue.trim()}
                        className={`px-4 py-2 rounded-lg font-medium ${
                            isLoading || !inputValue.trim()
                                ? 'bg-indigo-300 cursor-not-allowed'
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        } transition-colors`}
                        data-oid="kpk-7f5"
                    >
                        Send
                    </button>
                </form>
            </main>

            {/* Footer */}
            <footer className="bg-gray-100 p-4 border-t border-gray-200" data-oid="o0_z21a">
                <div
                    className="max-w-4xl mx-auto text-center text-gray-600 text-sm"
                    data-oid="hbvhd7f"
                >
                    <p data-oid="4t7l84g">
                        This AI assistant provides information about Max Gaspers Scott based on
                        available data.
                    </p>
                    <p className="mt-1" data-oid="zvpw4kq">
                        © {new Date().getFullYear()} Max Gaspers Scott AI Chat
                    </p>
                </div>
            </footer>
        </div>
    );
}
