import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import LoadingScreen from '@/components/LoadingScreen';
import AppShell from '@/components/AppShell';
import { Inter, Space_Grotesk } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const space = Space_Grotesk({ subsets: ['latin'], variable: '--font-heading' });

export const metadata = { title: 'Scholio-AI' };
export const dynamic = 'force-dynamic';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${space.variable}`}
      style={{ backgroundColor: '#0a0f1e', margin: 0, padding: 0 }}
    >
      <body
        className="bg-[#0a0f1e] text-slate-900 min-h-screen font-sans selection:bg-blue-100 selection:text-blue-900"
        style={{ backgroundColor: '#0a0f1e', margin: 0, padding: 0 }}
      >
        <AuthProvider>
          <LoadingScreen />
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
