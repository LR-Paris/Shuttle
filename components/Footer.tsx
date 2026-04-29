import { basePath } from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';
import { getVersion } from '@/lib/version';

interface FooterProps {
  footerText: string;
  primaryColor: string;
  bodyFont?: string;
  cornerRadius?: number;
  logoWhitePath?: string | null;
}

export default function Footer({ footerText, primaryColor, bodyFont = 'Inter', cornerRadius = 12, logoWhitePath }: FooterProps) {
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
            {/* Easter Egg */}
            <Link href="/secret" className="hover:opacity-100 transition-opacity" title="?">
              <Image
                src={`${basePath}/egg.svg`}
                alt=""
                width={12}
                height={15}
                className="opacity-30 hover:opacity-100 transition-opacity"
              />
            </Link>
          </div>
          {/* LR Paris Logo - white on black */}
          <a
            href="https://lrparis.com"
            target="_blank"
            rel="noopener noreferrer"
            className="block hover:opacity-90 transition-opacity rounded-lg p-2"
            style={{ backgroundColor: '#000000', borderRadius: `${cornerRadius}px` }}
          >
            <Image
              src={`${basePath}/lr-paris-logo.svg`}
              alt="LR Paris"
              width={60}
              height={60}
              className="block"
              style={{ filter: 'invert(1)' }}
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
