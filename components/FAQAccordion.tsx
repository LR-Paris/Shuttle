'use client';

import { useState } from 'react';
import type { FAQEntry } from '@/lib/design';

interface FAQAccordionProps {
  faqs: FAQEntry[];
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  borderColor: string;
}

// Helper function to format FAQ answer text with email links
function formatAnswer(answer: string, secondaryColor: string) {
  // Split by lines to preserve formatting
  const lines = answer.split('\n');

  return lines.map((line, lineIndex) => {
    // Skip empty lines but preserve spacing
    if (!line.trim()) {
      return <br key={`br-${lineIndex}`} />;
    }

    // Check if line contains email
    const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
    const parts = line.split(emailRegex);

    // Process line parts (text and emails)
    const processedLine = parts.map((part, partIndex) => {
      // Check if this part is an email
      if (emailRegex.test(part)) {
        emailRegex.lastIndex = 0; // Reset regex
        return (
          <a
            key={`email-${lineIndex}-${partIndex}`}
            href={`mailto:${part}`}
            className="underline hover:opacity-80"
            style={{ color: secondaryColor }}
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

export default function FAQAccordion({
  faqs,
  primaryColor,
  secondaryColor,
  textColor,
  borderColor,
}: FAQAccordionProps) {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <div className="space-y-4 max-w-4xl">
      {faqs.map((faq, index) => (
        <div
          key={index}
          className="border rounded-lg overflow-hidden"
          style={{ borderColor }}
        >
          {/* Question - Clickable Header */}
          <button
            onClick={() => toggleFAQ(index)}
            className="w-full text-left px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <h3 className="text-xl font-semibold pr-4" style={{ color: primaryColor }}>
              {faq.question}
            </h3>
            <svg
              className={`w-6 h-6 flex-shrink-0 transition-transform ${
                openFAQ === index ? 'rotate-180' : ''
              }`}
              style={{ color: primaryColor }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Answer - Collapsible Content */}
          {openFAQ === index && (
            <div className="px-6 py-4 border-t" style={{ borderColor }}>
              <div className="text-base leading-relaxed" style={{ color: textColor }}>
                {formatAnswer(faq.answer, secondaryColor)}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
