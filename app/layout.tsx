import HeaderAuth from "@/components/header-auth";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { GeistSans } from "geist/font/sans";
import { ThemeProvider } from "next-themes";
import Link from "next/link";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const defaultUrl = process.env.URL
  ? `https://${process.env.URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "MII Portfolio Tracker",
  description: "Beta",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GeistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <main className="min-h-screen flex flex-col items-center">
            <div className="flex-1 w-full flex flex-col items-center">
              <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
                <div className="w-full max-w-5xl flex justify-between items-center px-8 text-sm">
                  <div className="flex items-center font-semibold">
                    <Link href={"/"}><div className="text-3xl mr-4">🐮 MII</div></Link>
                  </div>
                  <h3 className="text-sm text-muted-foreground">Demo</h3>
                  <div className="inline-flex gap-2">
                  <HeaderAuth />
                  <ThemeSwitcher />
                  </div>
                </div>
              </nav>
              <div className="flex flex-col w-full px-5">
                {children}
              </div>
            </div>
          </main>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
