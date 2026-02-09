'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

// Helper function to format FAQ answer text with email links
function formatAnswer(answer: string, secondaryColor: string, bodyFont: string) {
  const lines = answer.split('\n');

  return lines.map((line, lineIndex) => {
    if (!line.trim()) {
      return <br key={`br-${lineIndex}`} />;
    }

    const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
    const parts = line.split(emailRegex);

    const processedLine = parts.map((part, partIndex) => {
      if (emailRegex.test(part)) {
        emailRegex.lastIndex = 0;
        return (
          <a
            key={`email-${lineIndex}-${partIndex}`}
            href={`mailto:${part}`}
            className="underline hover:opacity-80"
            style={{ color: secondaryColor, fontFamily: bodyFont }}
          >
            {part}
          </a>
        );
      }
      return part;
    });

    return (
      <p key={`line-${lineIndex}`} className="mb-2">
        {processedLine}
      </p>
    );
  });
}

export default function AboutPage() {
  const [design, setDesign] = useState<any>(null);
  const [versionInfo, setVersionInfo] = useState<any>(null);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  useEffect(() => {
    async function loadData() {
      const response = await fetch('/api/design');
      const designData = await response.json();
      setDesign(designData);
      document.title = `${designData.companyName} - About`;

      const versionResponse = await fetch('/api/version');
      const versionData = await versionResponse.json();
      setVersionInfo(versionData);

      const faqResponse = await fetch('/api/faq');
      const faqData = await faqResponse.json();
      setFaqs(faqData);
    }
    loadData();
  }, []);

  if (!design || !versionInfo) {
    return <div className="container mx-auto px-4 py-12">Loading...</div>;
  }

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      {/* About Section */}
      <section className="mb-16">
        <h1
          className="text-4xl font-bold mb-6"
          style={{
            color: design.colors.primary,
            fontFamily: design.fonts.titleFont,
          }}
        >
          About {design.companyName}
        </h1>
        <div className="max-w-3xl">
          <p
            className="text-lg leading-relaxed mb-4"
            style={{
              color: design.colors.text,
              fontFamily: design.fonts.bodyFont,
            }}
          >
            {design.descriptions.about}
          </p>
          <p
            className="text-lg leading-relaxed"
            style={{
              color: design.colors.text,
              fontFamily: design.fonts.bodyFont,
            }}
          >
            We are committed to providing exceptional wholesale products and outstanding service
            to our business partners. Our streamlined ordering system makes it easy to browse,
            select, and purchase products for your business needs.
          </p>
        </div>
      </section>

      {/* FAQ Section - Accordion Style */}
      <section className="mb-16">
        <h2
          className="text-3xl font-bold mb-8"
          style={{
            color: design.colors.primary,
            fontFamily: design.fonts.titleFont,
          }}
        >
          Frequently Asked Questions
        </h2>
        <div className="space-y-4 max-w-3xl">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border overflow-hidden"
              style={{
                borderColor: design.colors.border,
                borderRadius: `${design.style.cornerRadius}px`,
              }}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full text-left px-6 py-4 flex justify-between items-center hover:opacity-80 transition-opacity"
                style={{
                  backgroundColor: design.colors.background,
                }}
              >
                <h3
                  className="text-xl font-semibold pr-4"
                  style={{
                    color: design.colors.primary,
                    fontFamily: design.fonts.titleFont,
                  }}
                >
                  {faq.question}
                </h3>
                <svg
                  className="w-6 h-6 flex-shrink-0 transition-transform"
                  style={{
                    transform: openFAQ === index ? 'rotate(180deg)' : 'rotate(0deg)',
                    color: design.colors.secondary,
                  }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {openFAQ === index && (
                <div
                  className="px-6 py-4 border-t"
                  style={{
                    borderColor: design.colors.border,
                    backgroundColor: design.colors.background,
                  }}
                >
                  <div
                    className="text-base leading-relaxed"
                    style={{
                      color: design.colors.text,
                      fontFamily: design.fonts.bodyFont,
                    }}
                  >
                    {formatAnswer(faq.answer, design.colors.secondary, design.fonts.bodyFont)}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* System Information */}
      <section className="mb-8">
        <div
          className="border p-6 max-w-3xl"
          style={{
            borderColor: design.colors.border,
            backgroundColor: design.colors.background,
            borderRadius: `${design.style.cornerRadius}px`,
          }}
        >
          <h3
            className="text-lg font-semibold mb-3"
            style={{
              color: design.colors.primary,
              fontFamily: design.fonts.titleFont,
            }}
          >
            System Information
          </h3>
          <div
            className="space-y-2 text-sm"
            style={{
              color: design.colors.textLight,
              fontFamily: design.fonts.bodyFont,
            }}
          >
            <p>
              <strong>Platform:</strong> {versionInfo.name}
            </p>
            <p>
              <strong>Version:</strong> {versionInfo.version}
            </p>
            <p>
              <strong>Built with:</strong>{' '}
              <span style={{ color: design.colors.secondary }} className="font-semibold">
                LR Paris Shuttle
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* Built by LR Paris */}
      <section className="mb-8">
        <a
          href="https://lrparis.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 max-w-3xl p-6 border hover:shadow-md transition-shadow"
          style={{
            borderColor: design.colors.border,
            backgroundColor: design.colors.background,
            borderRadius: `${design.style.cornerRadius}px`,
          }}
        >
          <div className="bg-white rounded-lg p-3" style={{ borderRadius: '12px' }}>
            <img
              src="/lr-paris-logo.svg"
              alt="LR Paris"
              className="w-16 h-16"
            />
          </div>
          <div>
            <p
              className="text-lg font-semibold"
              style={{
                color: design.colors.primary,
                fontFamily: design.fonts.titleFont,
              }}
            >
              Built by LR Paris
            </p>
            <p
              className="text-sm"
              style={{
                color: design.colors.textLight,
                fontFamily: design.fonts.bodyFont,
              }}
            >
              Visit lrparis.com to learn more
            </p>
          </div>
        </a>
      </section>

      {/* Back to Home */}
      <div className="mt-12">
        <Link
          href="/"
          className="inline-block px-6 py-3 text-white font-semibold hover:opacity-90 transition-opacity"
          style={{
            backgroundColor: design.colors.secondary,
            borderRadius: `${design.style.cornerRadius}px`,
            fontFamily: design.fonts.bodyFont,
          }}
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
