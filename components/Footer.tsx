import Link from 'next/link';
import { getVersion } from '@/lib/version';

interface FooterProps {
  footerText: string;
  primaryColor: string;
  bodyFont?: string;
}

export default function Footer({ footerText, primaryColor, bodyFont = 'Inter' }: FooterProps) {
  const version = getVersion();

  return (
    <footer
      className="mt-auto py-8"
      style={{ backgroundColor: primaryColor }}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center space-y-2">
          <p className="text-center text-white text-sm" style={{ fontFamily: bodyFont }}>{footerText}</p>
          <p className="text-center text-white text-xs opacity-75" style={{ fontFamily: bodyFont }}>
            {version} • Built with LR Paris Shuttle •{' '}
            <Link href="/about" className="underline hover:opacity-80">
              About
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
