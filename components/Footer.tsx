import Link from 'next/link';
import Image from 'next/image';
import { getVersion } from '@/lib/version';

interface FooterProps {
  footerText: string;
  primaryColor: string;
  bodyFont?: string;
  cornerRadius?: number;
}

export default function Footer({ footerText, primaryColor, bodyFont = 'Inter', cornerRadius = 12 }: FooterProps) {
  const version = getVersion();

  return (
    <footer
      className="mt-auto py-8"
      style={{ backgroundColor: primaryColor }}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center space-y-4">
          <p className="text-center text-white text-sm" style={{ fontFamily: bodyFont }}>{footerText}</p>
          <div className="flex items-center gap-2">
            <p className="text-center text-white text-xs opacity-75" style={{ fontFamily: bodyFont }}>
              {version} • Built with LR Paris Shuttle •{' '}
              <Link href="/about" className="underline hover:opacity-80">
                About
              </Link>
            </p>
            {/* Easter Egg - subtle SVG */}
            <Link
              href="/secret"
              className="hover:opacity-100 transition-opacity"
              title="?"
            >
              <Image
                src="/egg.svg"
                alt=""
                width={12}
                height={15}
                className="opacity-30 hover:opacity-100 transition-opacity"
              />
            </Link>
          </div>
          {/* LR Paris Logo */}
          <a
            href="https://lrparis.com"
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-white rounded-lg p-2 hover:opacity-90 transition-opacity"
            style={{ borderRadius: `${cornerRadius}px` }}
          >
            <Image
              src="/lr-paris-logo.svg"
              alt="LR Paris"
              width={60}
              height={60}
              className="block"
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
