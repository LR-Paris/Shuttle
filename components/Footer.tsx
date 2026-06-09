import Link from 'next/link';
import Image from 'next/image';
import { getVersion } from '@/lib/version';

interface FooterProps {
  footerText: string;
  primaryColor: string;
  bodyFont?: string;
}

/**
 * Returns true when a hex color is light enough that black foreground
 * elements should be used on top of it. Falls back to "dark" (white
 * foreground) when the color can't be parsed.
 */
function isLightColor(hex: string): boolean {
  if (!hex) return false;
  let h = hex.trim().replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (h.length !== 6) return false;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  if ([r, g, b].some(isNaN)) return false;
  // Perceived luminance (ITU-R BT.601)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6;
}

export default function Footer({ footerText, primaryColor, bodyFont = 'Inter' }: FooterProps) {
  const version = getVersion();
  const lightBg = isLightColor(primaryColor);
  const textColor = lightBg ? '#1a1a1a' : '#ffffff';
  // LR Paris logo is black artwork on a transparent background:
  // keep it black on light footers, invert to white on dark footers.
  const logoFilter = lightBg ? 'brightness(0)' : 'brightness(0) invert(1)';

  return (
    <footer
      className="mt-auto py-8"
      style={{ backgroundColor: primaryColor }}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center space-y-4">
          <p className="text-center text-sm" style={{ fontFamily: bodyFont, color: textColor }}>{footerText}</p>
          <div className="flex items-center gap-2">
            <p className="text-center text-xs opacity-75" style={{ fontFamily: bodyFont, color: textColor }}>
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
          {/* LR Paris Logo — no background box, color adapts to footer background */}
          <a
            href="https://lrparis.com"
            target="_blank"
            rel="noopener noreferrer"
            className="block hover:opacity-90 transition-opacity"
            style={{ background: 'transparent' }}
          >
            <Image
              src="/lr-paris-logo.svg"
              alt="LR Paris"
              width={60}
              height={60}
              className="block"
              style={{ filter: logoFilter, background: 'transparent' }}
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
