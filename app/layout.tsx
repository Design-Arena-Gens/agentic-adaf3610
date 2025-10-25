import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Notion Page - Database Connected',
  description: 'A fully functional Notion-like page with database connectivity',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
