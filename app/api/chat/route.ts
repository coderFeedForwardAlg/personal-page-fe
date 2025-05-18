import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { text } = await request.json();

        // Get the backend URL from environment variable or use a default for local development
        const backendUrl = process.env.BACKEND_URL || 'http://backend:8000';
        const chatEndpoint = `${backendUrl}/chat`;

        // Helper function for fetch with timeout
        const fetchWithTimeout = async (url, options, timeout = 8000) => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);
            
            try {
                const response = await fetch(url, {
                    ...options,
                    signal: controller.signal
                });
                clearTimeout(timeoutId);
                return response;
            } catch (error) {
                clearTimeout(timeoutId);
                throw error;
            }
        };
        
        // Make a request to your backend with retry logic
        let backendResponse;
        let retries = 0;
        const maxRetries = 2;
        
        while (retries <= maxRetries) {
            try {
                backendResponse = await fetchWithTimeout(chatEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ text }),
                    // Use a shorter timeout for the first attempt, longer for retries
                    timeout: retries === 0 ? 5000 : 8000
                });
                break; // If successful, exit the retry loop
            } catch (fetchError) {
                retries++;
                console.log(`Retry attempt ${retries} for backend request`);
                if (retries > maxRetries) throw fetchError;
                // Wait before retrying (exponential backoff)
                await new Promise(r => setTimeout(r, 1000 * retries));
            }
        }

        if (!backendResponse || !backendResponse.ok) {
            throw new Error(`Backend responded with status: ${backendResponse?.status || 'network error'}`);
        }

        // Get the response data
        const data = await backendResponse.json();

        // If the response contains a message field that has the stream result
        if (data && data.message) {
            // Return just the message content to avoid displaying {"message": ...}
            return NextResponse.json({ content: data.message });
        }

        // Return the original response if it doesn't match the expected format
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error in chat API route:', error);
        
        // Enhanced error handling with more specific error messages
        let errorMessage = 'Failed to process request';
        let statusCode = 500;
        
        // Check if it's an abort error (user navigated away or timeout)
        const isAbortError = error.name === 'AbortError' ||
                            error.message?.includes('aborted') ||
                            error.message?.includes('abort');
        
        if (isAbortError) {
            // Return a 204 No Content for aborted requests
            return new NextResponse(null, { status: 204 });
        }
        
        // Network errors
        if (error.message?.includes('fetch') || error.message?.includes('network')) {
            errorMessage = 'Failed to connect to backend service';
            statusCode = 503; // Service Unavailable
        }
        
        // Timeout errors
        else if (error.message?.includes('timeout')) {
            errorMessage = 'Backend service took too long to respond';
            statusCode = 504; // Gateway Timeout
        }
        
        // Backend errors
        else if (error.message?.includes('Backend responded with status')) {
            errorMessage = error.message;
            // Keep status 500 for backend errors
        }
        
        return NextResponse.json({
            error: errorMessage,
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: statusCode });
    }
}
