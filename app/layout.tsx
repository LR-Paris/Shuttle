import type { Metadata } from "next";
import "./globals.css";
import { getDesignData } from "@/lib/design";
import { getAllCollections } from "@/lib/catalog";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export async function generateMetadata(): Promise<Metadata> {
  const design = getDesignData();
  return {
    title: design.companyName,
    description: design.descriptions.tagline,
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const design = getDesignData();
  const collections = getAllCollections();

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
            }
          `
        }} />
      </head>
      <body className="flex flex-col min-h-screen" style={{ backgroundColor: design.colors.background, color: design.colors.text }}>
        <Header
          companyName={design.companyName}
          logoPath={design.logoPath}
          primaryColor={design.colors.primary}
          secondaryColor={design.colors.secondary}
          collections={collections.map(c => ({ id: c.id, name: c.name }))}
        />
        <main className="flex-grow">
          {children}
        </main>
        <Footer
          footerText={design.descriptions.footer}
          primaryColor={design.colors.primary}
        />
      </body>
    </html>
  );
}
