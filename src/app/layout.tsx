// src/app/layout.tsx
import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "ChatGPT",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className=" h-[100vh]"
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
