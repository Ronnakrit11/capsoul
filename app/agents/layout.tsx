import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import localFont from "next/font/local";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const raleway = localFont({
  src: "../fonts/Raleway.woff2",
  variable: "--font-raleway",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Agent Portal | Capsoul COFFEE",
  description: "Agent portal for Capsoul COFFEE",
};

export default function AgentsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={raleway.variable}>
        <body className="antialiased">
          <Header />
          <main>{children}</main>
          <Footer />
          <Toaster position="bottom-right" theme="dark" />
        </body>
      </html>
    </ClerkProvider>
  );
}