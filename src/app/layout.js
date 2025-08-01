// app/layout.tsx
import Header from "@/components/Header";
import "./globals.css";
import { Montserrat } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
// Load fonts
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"], // Add more if needed
});

// Metadata for SEO
export const metadata = {
  title: "AI Finance Management",
  description: "AI Finance Management Website",
};

// Root layout component
export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`antialiased ${montserrat.className}`}>
          {/* Header */}
          <Header />
          <main className="min-h-screen">{children}</main>
          <Toaster richColors />
          {/* Footer */}
          <footer className="bg-blue-50 py-12">
            <div className="container mx-auto p-4 text-center text-gray-700">
              <p>Made with ❤️ Bilal Hassan</p>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
