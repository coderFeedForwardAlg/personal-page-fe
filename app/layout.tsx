import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
    title: 'Max Gaspers Scott',
    description: 'All you need to know about me',
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" data-oid="-zuwy3d">
            <body className="" data-oid="k71y.m-">
                {children}
            </body>
        </html>
    );
}
