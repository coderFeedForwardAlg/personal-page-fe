import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { text } = await request.json();

        // Make a request to your backend
        const backendResponse = await fetch('http://your-backend-url/chat', {
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

        // Return the response
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error in chat API route:', error);
        return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
    }
}
