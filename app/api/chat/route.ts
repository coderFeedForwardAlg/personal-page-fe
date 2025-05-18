import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { text } = await request.json();

        // Replace with your actual backend URL
        const backendUrl = 'http://your-backend-url/chat';

        // Make a request to your backend
        const backendResponse = await fetch(backendUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text }),
        });

        if (!backendResponse.ok) {
            throw new Error(`Backend responded with status: ${backendResponse.status}`);
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
        return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
    }
}
