import type { Metadata } from "next";
import "./globals.css";
import { getDesignData } from "@/lib/design";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PasswordProtection from "@/components/PasswordProtection";

export async function generateMetadata(): Promise<Metadata> {
  const design = getDesignData();
  return {
    title: design.companyName,
    description: design.descriptions.tagline,
    icons: {
      icon: '/favicon.ico',
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const design = getDesignData();

  return (
    <html lang="en">
      <head>
        <style dangerouslySetInnerHTML={{
          __html: `
            :root {
              --color-primary: ${design.colors.primary};
              --color-secondary: ${design.colors.secondary};
              --color-accent: ${design.colors.accent};
              --color-background: ${design.colors.background};
              --color-text: ${design.colors.text};
              --color-text-light: ${design.colors.textLight};
              --color-border: ${design.colors.border};
              --color-success: ${design.colors.success};
              --font-title: ${design.fonts.titleFont};
              --font-body: ${design.fonts.bodyFont};
              --corner-radius: ${design.style.cornerRadius}px;
            }
            body {
              font-family: ${design.fonts.bodyFont}, sans-serif;
            }
          `
        }} />
      </head>
      <body className="flex flex-col min-h-screen" style={{ backgroundColor: design.colors.background, color: design.colors.text }}>
        <PasswordProtection
          correctPassword={design.password}
          primaryColor={design.colors.primary}
          secondaryColor={design.colors.secondary}
          titleFont={design.fonts.titleFont}
          bodyFont={design.fonts.bodyFont}
          cornerRadius={design.style.cornerRadius}
          companyName={design.companyName}
        >
          <Header
            companyName={design.companyName}
            logoPath={design.logoPath}
            logoWhitePath={design.logoWhitePath}
            primaryColor={design.colors.primary}
            secondaryColor={design.colors.secondary}
            titleFont={design.fonts.titleFont}
            bodyFont={design.fonts.bodyFont}
            cornerRadius={design.style.cornerRadius}
          />
          <main className="flex-grow">
            {children}
          </main>
          <Footer
            footerText={design.descriptions.footer}
            primaryColor={design.colors.primary}
            bodyFont={design.fonts.bodyFont}
            cornerRadius={design.style.cornerRadius}
          />
        </PasswordProtection>
      </body>
    </html>
  );
}
