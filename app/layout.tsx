import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/navbar';
import { ToastProvider } from '@/components/toast-provider';

export const metadata: Metadata = {
  title: 'Pexels Finder',
  description: 'Search and save Pexels photos with Supabase auth.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          <Navbar />
          <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-8">{children}</main>
        </ToastProvider>
      </body>
    </html>
  );
}
