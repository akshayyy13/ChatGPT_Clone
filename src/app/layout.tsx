// src/app/layout.tsx
import "./globals.css";
import Providers from "./providers";

export const metadata = { title: "ChatGPT" };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        style={{
          background: "var(--bg-primary)",
          color: "var(--text-primary)",
        }}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
