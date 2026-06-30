import type { Metadata } from 'next';
import 'react-datepicker/dist/react-datepicker.css';
import './globals.css';
import Header from './components/Header';
import Footer from './components/Footer';
import { AuthProvider } from '@/app/context/AuthContext';

export const metadata: Metadata = {
  title: 'Art Museum',
  description: 'Art museum web application',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='ru'>
    <body>
    <AuthProvider>
      <Header />
      <main className='min-h-screen'>{children}</main>
      <Footer />
    </AuthProvider>
    </body>
    </html>
  );
}
