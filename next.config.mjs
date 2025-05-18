import path from 'path';
/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    env: {
        BACKEND_URL: process.env.BACKEND_URL || 'http://backend:8000',
    },
    // Add experimental features for improved network reliability
    experimental: {
        // Enable streaming responses
        serverActions: {
            bodySizeLimit: '2mb',
        },
        // Improve connection reliability
        optimizePackageImports: ['react', 'react-dom'],
    },
    // Configure longer timeouts for API routes
    api: {
        responseLimit: false,
        // Increase bodyParser limit for larger payloads
        bodyParser: {
            sizeLimit: '1mb',
        },
    },
};
export default nextConfig;
