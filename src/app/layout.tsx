import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: '360° Product Viewer',
    template: '%s | 360° Product Viewer',
  },
  description: 'Interactive 360° product viewer for e-commerce with multi-angle rotation',
  keywords: ['360', 'product viewer', 'e-commerce', 'spin viewer', '3D viewer', 'turntable'],
  authors: [{ name: 'Product Spin Viewer Team' }],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: '360° Product Viewer',
    title: '360° Product Viewer - E-Commerce Platform',
    description: 'Interactive 360° product viewer for e-commerce with multi-angle rotation',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col antialiased">
        <main className="flex flex-1 flex-col">{children}</main>
      </body>
    </html>
  );
}
