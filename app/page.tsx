'use client';

import { useState, useEffect, useRef } from 'react';

// Define the message interface
interface Message {
    id?: string;
    text: string;
    sender: 'user' | 'ai';
    error?: boolean;
    isStreaming?: boolean;
}

export default function Page() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

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
        const userMessage: Message = {
            id: `user-${Date.now()}`,
            text: inputValue,
            sender: 'user'
        };
        setMessages((prev) => [...prev, userMessage]);
        setIsLoading(true);
        setInputValue('');

        try {
            // Send request to our Next.js API endpoint with timeout and retry logic
            const fetchWithTimeout = async (url, options, timeout = 10000) => {
                const controller = new AbortController();
                const id = setTimeout(() => controller.abort(), timeout);
                
                const response = await fetch(url, {
                    ...options,
                    signal: controller.signal
                });
                clearTimeout(id);
                return response;
            };
            
            // Try the fetch with up to 2 retries
            let response;
            let retries = 0;
            const maxRetries = 2;
            
            while (retries <= maxRetries) {
                try {
                    response = await fetchWithTimeout('/api/chat', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ text: userMessage.text }),
                    });
                    break; // If successful, exit the retry loop
                } catch (fetchError) {
                    retries++;
                    if (retries > maxRetries) throw fetchError;
                    // Wait before retrying (exponential backoff)
                    await new Promise(r => setTimeout(r, 1000 * retries));
                }
            }

            if (!response || !response.ok) {
                throw new Error(`Failed to get response: ${response?.status || 'network error'}`);
            }

            // Parse the JSON response with error handling
            let data;
            try {
                data = await response.json();
            } catch (jsonError) {
                console.error('Error parsing JSON:', jsonError);
                throw new Error('Failed to parse response data');
            }
            
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
                    id: `ai-${Date.now()}`,
                    text: messageText,
                    sender: 'ai',
                },
            ]);
        } catch (error) {
            console.error('Error:', error);
            
            // Provide more specific error messages based on the error type
            let errorMessage = "Sorry, I couldn't connect to the server. Please try again later.";
            
            if (error.name === 'AbortError') {
                errorMessage = "The request timed out. Please check your internet connection and try again.";
            } else if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                errorMessage = "Network error. Please check your internet connection or try using a different browser.";
            } else if (error.message.includes('parse')) {
                errorMessage = "There was a problem processing the response. Please try again.";
            }
            
            setMessages((prev) => [
                ...prev,
                {
                    id: `error-${Date.now()}`,
                    text: errorMessage,
                    sender: 'ai',
                    error: true,
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-indigo-600 text-white p-4 shadow-md">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Max Gaspers Scott AI Chat</h1>
                    <p className="text-indigo-200">Ask anything about Max</p>
                </div>
            </header>

            {/* Main content */}
            <main className="flex-grow max-w-4xl w-full mx-auto p-4 flex flex-col">
                {/* Welcome message */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-semibold text-indigo-700 mb-2">
                        Welcome to Max Gaspers Scott AI Assistant
                    </h2>
                    <p className="text-gray-600">
                        Ask me any questions about Max Gaspers Scott and I&apos;ll provide you with
                        information. Try questions about his background, work, or interests!
                    </p>
                </div>

                {/* Chat container */}
                <div className="flex-grow bg-white rounded-lg shadow-md p-4 mb-4 overflow-y-auto">
                    <div className="space-y-4 min-h-[300px] max-h-[500px] overflow-y-auto">
                        {messages.length === 0 ? (
                            <div className="text-center text-gray-400 mt-20">
                                <p>No messages yet. Start the conversation!</p>
                            </div>
                        ) : (
                            messages.map((message) => (
                                <div
                                    key={message.id || `msg-${Math.random()}`}
                                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] rounded-lg p-3 ${
                                            message.sender === 'user'
                                                ? 'bg-indigo-500 text-white rounded-br-none'
                                                : message.error
                                                  ? 'bg-red-100 text-red-700 rounded-bl-none'
                                                  : 'bg-gray-100 text-gray-800 rounded-bl-none'
                                        }`}
                                    >
                                        {typeof message.text === 'object'
                                            ? JSON.stringify(message.text)
                                            : message.text}
                                        {message.isStreaming && (
                                            <span className="ml-2 inline-flex">
                                                <span className="w-1 h-1 bg-gray-500 rounded-full animate-pulse mr-1"></span>
                                                <span className="w-1 h-1 bg-gray-500 rounded-full animate-pulse mr-1" style={{ animationDelay: '0.2s' }}></span>
                                                <span className="w-1 h-1 bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-gray-100 rounded-lg p-3 rounded-bl-none">
                                    <div className="flex space-x-2">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                        <div
                                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                            style={{ animationDelay: '0.2s' }}
                                        ></div>
                                        <div
                                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                            style={{ animationDelay: '0.4s' }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Input form */}
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Ask something about Max Gaspers Scott..."
                        className="flex-grow p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />

                    <button
                        type="submit"
                        disabled={isLoading || !inputValue.trim()}
                        className={`px-4 py-2 rounded-lg font-medium ${
                            isLoading || !inputValue.trim()
                                ? 'bg-indigo-300 cursor-not-allowed'
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        } transition-colors`}
                    >
                        Send
                    </button>
                </form>
            </main>

            {/* Footer */}
            <footer className="bg-gray-100 p-4 border-t border-gray-200">
                <div className="max-w-4xl mx-auto text-center text-gray-600 text-sm">
                    <p>
                        This AI assistant provides information about Max Gaspers Scott based on
                        available data.
                    </p>
                </div>
            </footer>
        </div>
    );
}
