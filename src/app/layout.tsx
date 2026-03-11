import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "F1 Fun - Betting League",
  description: "F1 Fun Betting League - Predict race results and win F1 coins!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="carbon-bg antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
