import { Geist } from "next/font/google";
import AppNavbar from "@/components/AppNavbar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata = {
  title: "Clash Of Stats",
  description: "Wallahi",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground"><AppNavbar />{children}</body>
    </html>
  );
}
