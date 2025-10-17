import "./globals.css";
import { Toaster } from "sonner";
import { Inter } from "next/font/google";

import Header from "@/components/Header";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Wealth - Management",
  description: "Wealth management is a high-level, comprehensive financial advisory service for individuals and families with significant assets. Instead of focusing on a single area, it takes a holistic, client-centric approach to help grow, preserve, and pass on wealth across generations.",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className}`}>
          {/* header */}
          <Header />
          <main className="min-h-screen">{children}</main>
          <Toaster richColors/>
          {/* footer */}

          <footer className="bg-blue-50 py-12">
            <div className="container mx-auto px-4 text-center text-gray-600">
              <p>Made with 💓 by GodDev - Adarsh.</p>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
