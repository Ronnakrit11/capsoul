import type { Metadata } from "next";
import { Toaster } from "sonner";
import localFont from "next/font/local";
import Link from "next/link";

const raleway = localFont({
  src: "../fonts/Raleway.woff2",
  variable: "--font-raleway",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Dashboard | Capsoul COFFEE",
  description: "Admin dashboard for Capsoul COFFEE",
};

// Use a static year to avoid hydration errors
const Footer = () => {
  return (
    <footer className="bg-gray-100 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
        &copy; 2025 Capsoul COFFEE. All rights reserved.
      </div>
    </footer>
  );
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={raleway.variable}>
      <body className="antialiased">
        <header className="border-b border-b-gray-400 py-5 sticky top-0 z-50 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <Link href="/" className="text-xl font-bold">
              Capsoul COFFEE
            </Link>
            <Link href="/dashboard" className="text-sm font-semibold hover:text-gray-700">
              Dashboard
            </Link>
          </div>
        </header>
        <main>{children}</main>
        <Footer />
        <Toaster position="bottom-right" theme="dark" />
      </body>
    </html>
  );
}