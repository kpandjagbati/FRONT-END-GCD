import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "GetCallDetail | Yas",
  description: "Interface GetCallDetail Yas",
  icons: {
    icon: "/logo-yas.svg",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" data-theme="light" suppressHydrationWarning>
      <body className={`${montserrat.variable} min-h-full font-sans antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
