import { getDesignData, getFAQData } from '@/lib/design';
import { getVersionInfo } from '@/lib/version';
import Link from 'next/link';
import FAQAccordion from '@/components/FAQAccordion';

export default function AboutPage() {
  const design = getDesignData();
  const versionInfo = getVersionInfo();
  const faqs = getFAQData();

  return (
    <div className="container mx-auto px-4 py-12">
      {/* About Section */}
      <section className="mb-16">
        <h1 className="text-4xl font-bold mb-6" style={{ color: design.colors.primary }}>
          About {design.companyName}
        </h1>
        <div className="max-w-3xl">
          <p className="text-lg leading-relaxed mb-4" style={{ color: design.colors.text }}>
            {design.descriptions.about}
          </p>
          <p className="text-lg leading-relaxed" style={{ color: design.colors.text }}>
            We are committed to providing exceptional wholesale products and outstanding service
            to our business partners. Our streamlined ordering system makes it easy to browse,
            select, and purchase products for your business needs.
          </p>
        </div>
      </section>

      {/* FAQ Section with Accordion */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-8" style={{ color: design.colors.primary }}>
          Frequently Asked Questions
        </h2>
        <FAQAccordion
          faqs={faqs}
          primaryColor={design.colors.primary}
          secondaryColor={design.colors.secondary}
          textColor={design.colors.text}
          borderColor={design.colors.border}
        />
      </section>

      {/* System Information */}
      <section className="mb-8">
        <div
          className="border rounded-lg p-6 max-w-2xl"
          style={{ borderColor: design.colors.border, backgroundColor: '#f9fafb' }}
        >
          <h3 className="text-lg font-semibold mb-3" style={{ color: design.colors.primary }}>
            System Information
          </h3>
          <div className="space-y-2 text-sm" style={{ color: design.colors.textLight }}>
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

      {/* Back to Home */}
      <div className="mt-12">
        <Link
          href="/"
          className="inline-block px-6 py-3 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
          style={{ backgroundColor: design.colors.secondary }}
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
