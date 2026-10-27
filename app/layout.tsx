import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { HeaderMegaMenu } from '@/components/navigation/HeaderMegaMenu';
import { Footer } from '@/components/layout/Footer';
import { VoiceConcierge } from '@/components/voice/VoiceConcierge';

export const metadata: Metadata = {
  title: 'DriverConnect — Premier Automotive Mobility & Commerce in Tanzania',
  description:
    'Rent executive SUVs and budget cars with doorstep delivery, purchase verified vehicles with TZS 1.3M reservation holds, book certified auto repairs, and chat with Ava AI voice concierge.',
  keywords: [
    'Car Rental Tanzania',
    'Rent Car Dar es Salaam',
    'Toyota Prado rental Tanzania',
    'Buy cars Tanzania',
    'Car mechanics Dar es Salaam',
    'DriverConnect TZS',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="amber" className="dark">
      <body className="min-h-screen flex flex-col bg-background text-foreground antialiased selection:bg-primary selection:text-primary-foreground">
        <ThemeProvider>
          <HeaderMegaMenu />
          <main className="flex-1">{children}</main>
          <Footer />
          <VoiceConcierge />
        </ThemeProvider>
      </body>
    </html>
  );
}
