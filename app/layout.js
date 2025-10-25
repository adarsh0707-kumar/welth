import "./globals.css";
import { Toaster } from "sonner";
import { Inter } from "next/font/google";

import Header from "@/components/Header";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({ subsets: ["latin"] });


/**
 * Metadata for the application, used for SEO and page information.
 */

export const metadata = {
  title: "Wealth - Management",
  description: "Wealth management is a high-level, comprehensive financial advisory service for individuals and families with significant assets. Instead of focusing on a single area, it takes a holistic, client-centric approach to help grow, preserve, and pass on wealth across generations.",
};

/**
 * RootLayout component wraps the entire application.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Content of the page wrapped by the layout
 * 
 * @component
 * @example
 * <RootLayout>
 *   <HomePage />
 * </RootLayout>
 * 
 * @returns {JSX.Element} The layout wrapping children with header, footer, and global providers
 * 
 * @remarks
 * - Uses `ClerkProvider` for authentication.
 * - Loads the Inter font from Google Fonts.
 * - Renders a `Header` at the top and a `footer` at the bottom.
 * - Includes `Toaster` for notifications.
 * - Applies the Inter font class to the `<body>`.
 */

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
