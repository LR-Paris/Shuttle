'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getCart, clearCart, type Cart } from '@/lib/cart';

interface DesignData {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    textLight: string;
    border: string;
    success: string;
  };
  fonts: {
    titleFont: string;
    bodyFont: string;
  };
  style: {
    cornerRadius: number;
  };
}

interface PresetsData {
  shopType: 'free' | 'po' | 'stripe';
  dataRequired: {
    address: boolean;
    details: boolean;
    extra_notes: boolean;
    shipping_handler: boolean;
    hotel_list: boolean;
    billing_address: boolean;
    in_hand_date: boolean;
    estimated_budget: boolean;
    po_number: boolean;
    brand_list: boolean;
    art_link: boolean;
  };
  hotelList: string[];
  brandList: string[];
  display: {
    show_prices: boolean;
    request_language: boolean;
  };
}

const FALLBACK_PRESETS: PresetsData = {
  shopType: 'free',
  dataRequired: {
    address: true,
    details: true,
    extra_notes: true,
    shipping_handler: true,
    hotel_list: false,
    billing_address: false,
    in_hand_date: false,
    estimated_budget: false,
    po_number: false,
    brand_list: false,
    art_link: false,
  },
  hotelList: [],
  brandList: [],
  display: { show_prices: true, request_language: false },
};

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart>({ items: [], total: 0 });
  const [design, setDesign] = useState<DesignData | null>(null);
  const [presets, setPresets] = useState<PresetsData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 01 — Your details
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');

  // 02 — Brand
  const [brand, setBrand] = useState('');

  // 03 — Ship to
  const [address, setAddress] = useState('');
  const [apt, setApt] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [province, setProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // 04 — Billing
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const [billingAddress, setBillingAddress] = useState('');
  const [billingApt, setBillingApt] = useState('');
  const [billingCity, setBillingCity] = useState('');
  const [billingCountry, setBillingCountry] = useState('');
  const [billingProvince, setBillingProvince] = useState('');
  const [billingPostalCode, setBillingPostalCode] = useState('');

  // 05 — Timing
  const [inHandDate, setInHandDate] = useState('');

  // 06 — Budget and PO
  const [estimatedBudget, setEstimatedBudget] = useState('');
  const [poNumber, setPoNumber] = useState('');

  // 07 — Artwork
  const [artLink, setArtLink] = useState('');

  // 08 — Notes
  const [orderNotes, setOrderNotes] = useState('');

  // Legacy fields, still driven by their original toggles
  const [freightOption, setFreightOption] = useState<'lr-paris' | 'own'>('lr-paris');
  const [freightCompany, setFreightCompany] = useState('');
  const [freightAccount, setFreightAccount] = useState('');
  const [freightContact, setFreightContact] = useState('');
  const [hotelSelection, setHotelSelection] = useState('');
  const [poFile, setPoFile] = useState<File | null>(null);
  const poFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const currentCart = getCart();
    if (currentCart.items.length === 0) {
      router.push('/cart');
      return;
    }
    setCart(currentCart);

    fetch('/api/design')
      .then(r => r.json())
      .then(setDesign)
      .catch(console.error);

    fetch('/api/presets')
      .then(r => r.json())
      .then((data: PresetsData) => {
        // An older Shuttle may answer without the newer blocks.
        setPresets({
          ...FALLBACK_PRESETS,
          ...data,
          dataRequired: { ...FALLBACK_PRESETS.dataRequired, ...(data?.dataRequired || {}) },
          display: { ...FALLBACK_PRESETS.display, ...(data?.display || {}) },
          hotelList: data?.hotelList || [],
          brandList: data?.brandList || [],
        });
      })
      .catch(() => setPresets(FALLBACK_PRESETS));
  }, [router]);

  const composeAddress = (
    line1: string, line2: string, town: string,
    region: string, postal: string, nation: string,
  ) => `${firstName} ${lastName}\n${line1}${line2 ? '\n' + line2 : ''}\n${town}, ${region} ${postal}\n${nation}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const submitNoun = presets?.display.request_language ? 'request' : 'order';

    try {
      if (!firstName.trim() || !lastName.trim()) {
        alert('Please enter your first and last name.');
        setIsSubmitting(false);
        return;
      }
      if (!email.trim()) {
        alert('Please enter your email address.');
        setIsSubmitting(false);
        return;
      }
      if (presets?.dataRequired.brand_list && !brand.trim()) {
        alert('Please select the brand you are submitting for.');
        setIsSubmitting(false);
        return;
      }

      // PO shops still require an uploaded document. A po_number text field on
      // its own is just a reference number and never requires a file.
      if (presets?.shopType === 'po') {
        if (!poNumber) {
          alert('Please enter a Purchase Order number.');
          setIsSubmitting(false);
          return;
        }
        if (!poFile) {
          alert('Please upload a Purchase Order file (PDF, HTML, TXT, or Word).');
          setIsSubmitting(false);
          return;
        }
      }

      const dr = presets?.dataRequired;

      const shippingAddress = dr?.address
        ? composeAddress(address, apt, city, province, postalCode, country)
        : '';

      let billing = '';
      if (dr?.billing_address) {
        billing = billingSameAsShipping
          ? shippingAddress
          : composeAddress(billingAddress, billingApt, billingCity, billingProvince, billingPostalCode, billingCountry);
      }

      const orderData = {
        name: `${firstName} ${lastName}`,
        email,
        phone: dr?.details ? phone : '',
        company: dr?.details ? company : '',
        shippingAddress,
        billingAddress: billing,
        brand: dr?.brand_list ? brand : '',
        inHandDate: dr?.in_hand_date ? inHandDate : '',
        estimatedBudget: dr?.estimated_budget ? estimatedBudget : '',
        artLink: dr?.art_link ? artLink : '',
        freightOption: dr?.shipping_handler ? freightOption : '',
        freightCompany: dr?.shipping_handler && freightOption === 'own' ? freightCompany : '',
        freightAccount: dr?.shipping_handler && freightOption === 'own' ? freightAccount : '',
        freightContact: dr?.shipping_handler && freightOption === 'own' ? freightContact : '',
        orderNotes: dr?.extra_notes ? orderNotes : '',
        items: cart.items,
        total: cart.total,
        shopType: presets?.shopType || 'free',
        // A PO number can arrive from the PO shop flow or the standalone field.
        poNumber: presets?.shopType === 'po' || dr?.po_number ? poNumber : '',
        hotelSelection: dr?.hotel_list ? hotelSelection : '',
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (response.status === 409 && result.outOfStockItems) {
        const itemLines = result.outOfStockItems
          .map((item: { productName: string; requested: number; available: number }) =>
            `- ${item.productName}: requested ${item.requested}, only ${item.available} left in stock`
          )
          .join('\n');
        alert(`Some items are no longer available:\n\n${itemLines}\n\nPlease go back and update quantities.`);
        setIsSubmitting(false);
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to submit ${submitNoun}`);
      }

      if (presets?.shopType === 'po' && poFile) {
        const formData = new FormData();
        formData.append('po_file', poFile);
        formData.append('order_id', result.orderId);

        const uploadResponse = await fetch('/api/orders/upload-po', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          console.error(`Failed to upload PO file, but the ${submitNoun} was submitted`);
        }
      }

      sessionStorage.setItem('lastOrder', JSON.stringify({
        orderId: result.orderId,
        date: new Date().toISOString(),
        name: `${firstName} ${lastName}`,
        company,
        brand: orderData.brand,
        inHandDate: orderData.inHandDate,
        items: cart.items,
        total: cart.total,
        shopType: presets?.shopType || 'free',
        poNumber: orderData.poNumber,
        hotelSelection: orderData.hotelSelection,
      }));

      clearCart();
      window.dispatchEvent(new Event('cartUpdated'));

      router.push(`/order-success?orderId=${result.orderId}`);
    } catch (error) {
      console.error(`Error submitting ${submitNoun}:`, error);
      alert(`Failed to submit ${submitNoun}. Please try again.`);
      setIsSubmitting(false);
    }
  };

  if (!design || !presets) {
    return (
      <div className="container mx-auto px-4 py-12">
        <p>Loading...</p>
      </div>
    );
  }

  const dr = presets.dataRequired;
  const showPrices = presets.display.show_prices;
  const isRequest = presets.display.request_language;

  const sectionStyle = {
    borderColor: design.colors.border,
    borderRadius: `${design.style.cornerRadius}px`,
  };
  const inputStyle = {
    borderColor: design.colors.border,
    borderRadius: `${design.style.cornerRadius}px`,
    fontFamily: design.fonts.bodyFont,
  };
  const labelStyle = { color: design.colors.text, fontFamily: design.fonts.bodyFont };
  const headingStyle = { color: design.colors.primary, fontFamily: design.fonts.titleFont };
  const inputClass = 'w-full px-4 py-2 border focus:outline-none focus:ring-2';

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="border p-6" style={sectionStyle}>
      <h2 className="text-2xl font-bold mb-4" style={headingStyle}>{title}</h2>
      {children}
    </div>
  );

  const Field = ({ label, span, children }: { label: string; span?: boolean; children: React.ReactNode }) => (
    <div className={span ? 'md:col-span-2' : undefined}>
      <label className="block text-sm font-semibold mb-2" style={labelStyle}>{label}</label>
      {children}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-2" style={headingStyle}>
        {isRequest ? 'Request Order' : 'Checkout'}
      </h1>
      {isRequest && (
        <p className="mb-8 max-w-2xl" style={{ color: design.colors.textLight, fontFamily: design.fonts.bodyFont }}>
          Submitting this sends your selection for approval. It is not an order confirmation.
          Nothing is produced or shipped until we confirm specifications, pricing and lead time in writing.
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* 01 — Your details */}
            <Section title="Your Details">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="First name *">
                  <input type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)}
                    className={inputClass} style={inputStyle} />
                </Field>
                <Field label="Last name *">
                  <input type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)}
                    className={inputClass} style={inputStyle} />
                </Field>
                <Field label="Email *" span>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    className={inputClass} style={inputStyle} />
                </Field>
                {dr.details && (
                  <>
                    <Field label="Phone number *">
                      <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)}
                        className={inputClass} style={inputStyle} />
                    </Field>
                    <Field label="Company *">
                      <input type="text" required value={company} onChange={(e) => setCompany(e.target.value)}
                        className={inputClass} style={inputStyle} />
                    </Field>
                  </>
                )}
              </div>
            </Section>

            {/* 02 — Brand */}
            {dr.brand_list && (
              <Section title="Brand">
                <Field label={presets.brandList.length > 0 ? 'Which brand are you submitting for? *' : 'Which brand are you submitting for? *'}>
                  {presets.brandList.length > 0 ? (
                    <select required value={brand} onChange={(e) => setBrand(e.target.value)}
                      className={`${inputClass} bg-white`} style={inputStyle}>
                      <option value="">-- Select a brand --</option>
                      {presets.brandList.map((b, i) => (
                        <option key={i} value={b}>{b}</option>
                      ))}
                    </select>
                  ) : (
                    <input type="text" required value={brand} onChange={(e) => setBrand(e.target.value)}
                      className={inputClass} style={inputStyle} placeholder="Enter your brand" />
                  )}
                </Field>
              </Section>
            )}

            {/* 03 — Ship to */}
            {dr.address && (
              <Section title="Ship To Address">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold mb-2" style={labelStyle}>Address *</label>
                      <input type="text" required value={address} onChange={(e) => setAddress(e.target.value)}
                        className={inputClass} style={inputStyle} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={labelStyle}>Apt, suite, etc. (optional)</label>
                      <input type="text" value={apt} onChange={(e) => setApt(e.target.value)}
                        className={inputClass} style={inputStyle} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={labelStyle}>City *</label>
                    <input type="text" required value={city} onChange={(e) => setCity(e.target.value)}
                      className={inputClass} style={inputStyle} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={labelStyle}>Country *</label>
                      <input type="text" required value={country} onChange={(e) => setCountry(e.target.value)}
                        className={inputClass} style={inputStyle} placeholder="United States" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={labelStyle}>State *</label>
                      <input type="text" required value={province} onChange={(e) => setProvince(e.target.value)}
                        className={inputClass} style={inputStyle} placeholder="NY" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={labelStyle}>ZIP code *</label>
                      <input type="text" required value={postalCode} onChange={(e) => setPostalCode(e.target.value)}
                        className={inputClass} style={inputStyle} placeholder="10001" />
                    </div>
                  </div>
                </div>
              </Section>
            )}

            {/* 04 — Billing */}
            {dr.billing_address && (
              <Section title="Billing Address">
                <div className="space-y-4">
                  {dr.address && (
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={billingSameAsShipping}
                        onChange={(e) => setBillingSameAsShipping(e.target.checked)} />
                      <span className="text-sm font-semibold" style={labelStyle}>Same as ship to address</span>
                    </label>
                  )}
                  {(!billingSameAsShipping || !dr.address) && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-semibold mb-2" style={labelStyle}>Address *</label>
                          <input type="text" required value={billingAddress} onChange={(e) => setBillingAddress(e.target.value)}
                            className={inputClass} style={inputStyle} />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-2" style={labelStyle}>Apt, suite, etc. (optional)</label>
                          <input type="text" value={billingApt} onChange={(e) => setBillingApt(e.target.value)}
                            className={inputClass} style={inputStyle} />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2" style={labelStyle}>City *</label>
                        <input type="text" required value={billingCity} onChange={(e) => setBillingCity(e.target.value)}
                          className={inputClass} style={inputStyle} />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-semibold mb-2" style={labelStyle}>Country *</label>
                          <input type="text" required value={billingCountry} onChange={(e) => setBillingCountry(e.target.value)}
                            className={inputClass} style={inputStyle} placeholder="United States" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-2" style={labelStyle}>State *</label>
                          <input type="text" required value={billingProvince} onChange={(e) => setBillingProvince(e.target.value)}
                            className={inputClass} style={inputStyle} placeholder="NY" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-2" style={labelStyle}>ZIP code *</label>
                          <input type="text" required value={billingPostalCode} onChange={(e) => setBillingPostalCode(e.target.value)}
                            className={inputClass} style={inputStyle} placeholder="10001" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Section>
            )}

            {/* 05 — Timing */}
            {dr.in_hand_date && (
              <Section title="Timing">
                <Field label="In hand date requested *">
                  <input type="date" required value={inHandDate} onChange={(e) => setInHandDate(e.target.value)}
                    className={inputClass} style={inputStyle} />
                  <p className="text-xs mt-2" style={{ color: design.colors.textLight, fontFamily: design.fonts.bodyFont }}>
                    The date you need stock in hand, not the ship date. Production and freight are quoted backward from here.
                  </p>
                </Field>
              </Section>
            )}

            {/* 06 — Budget and PO */}
            {(dr.estimated_budget || dr.po_number) && (
              <Section title="Budget & Purchase Order">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dr.estimated_budget && (
                    <Field label="Estimated budget *">
                      <input type="text" required value={estimatedBudget} onChange={(e) => setEstimatedBudget(e.target.value)}
                        className={inputClass} style={inputStyle} placeholder="e.g. $25,000" />
                    </Field>
                  )}
                  {dr.po_number && presets.shopType !== 'po' && (
                    <Field label="PO number (optional)">
                      <input type="text" value={poNumber} onChange={(e) => setPoNumber(e.target.value)}
                        className={inputClass} style={inputStyle} placeholder="If you already have one" />
                    </Field>
                  )}
                </div>
              </Section>
            )}

            {/* 07 — Artwork */}
            {dr.art_link && (
              <Section title="Custom Artwork">
                <Field label="Link to custom art (optional)">
                  <input type="url" value={artLink} onChange={(e) => setArtLink(e.target.value)}
                    className={inputClass} style={inputStyle}
                    placeholder="https://..." />
                  <p className="text-xs mt-2" style={{ color: design.colors.textLight, fontFamily: design.fonts.bodyFont }}>
                    A shared folder or file link. Leave blank if artwork is still in progress.
                  </p>
                </Field>
              </Section>
            )}

            {/* Hotel selection — legacy toggle */}
            {dr.hotel_list && (
              <Section title="Hotel Selection">
                <Field label={presets.hotelList.length > 0 ? 'Select your hotel' : 'Enter your hotel'}>
                  {presets.hotelList.length > 0 ? (
                    <select required value={hotelSelection} onChange={(e) => setHotelSelection(e.target.value)}
                      className={`${inputClass} bg-white`} style={inputStyle}>
                      <option value="">-- Select a hotel --</option>
                      {presets.hotelList.map((hotel, index) => (
                        <option key={index} value={hotel}>{hotel}</option>
                      ))}
                    </select>
                  ) : (
                    <input type="text" required value={hotelSelection} onChange={(e) => setHotelSelection(e.target.value)}
                      className={inputClass} style={inputStyle} placeholder="Enter your hotel name" />
                  )}
                </Field>
              </Section>
            )}

            {/* Purchase Order document — PO shop type only */}
            {presets.shopType === 'po' && (
              <Section title="Purchase Order">
                <div className="space-y-4">
                  <Field label="PO Number *">
                    <input type="text" required value={poNumber} onChange={(e) => setPoNumber(e.target.value)}
                      className={inputClass} style={inputStyle} placeholder="Enter your Purchase Order number" />
                  </Field>
                  <Field label="Upload PO Document *">
                    <input ref={poFileRef} type="file" required
                      accept=".pdf,.html,.htm,.txt,.doc,.docx,application/pdf,text/html,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={(e) => setPoFile(e.target.files?.[0] || null)}
                      className={inputClass} style={inputStyle} />
                    <p className="text-xs mt-1" style={{ color: design.colors.textLight, fontFamily: design.fonts.bodyFont }}>
                      Accepted formats: PDF, HTML, TXT, Word (.doc/.docx)
                    </p>
                  </Field>
                  {poFile && (
                    <div className="flex items-center gap-2 text-sm px-3 py-2 rounded" style={{ backgroundColor: `${design.colors.success}15`, color: design.colors.success }}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{poFile.name} ({(poFile.size / 1024).toFixed(1)} KB)</span>
                    </div>
                  )}
                </div>
              </Section>
            )}

            {/* Stripe placeholder */}
            {presets.shopType === 'stripe' && (
              <Section title="Payment">
                <div className="text-center py-8" style={{ color: design.colors.textLight, fontFamily: design.fonts.bodyFont }}>
                  <p className="text-lg font-semibold mb-2">Stripe Payment Integration</p>
                  <p>Coming soon. This shop is not yet configured for payments.</p>
                </div>
              </Section>
            )}

            {/* Freight — legacy toggle */}
            {dr.shipping_handler && (
              <Section title="Freight Options">
                <div className="space-y-4">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input type="radio" name="freight" value="lr-paris"
                      checked={freightOption === 'lr-paris'}
                      onChange={(e) => setFreightOption(e.target.value as 'lr-paris')} className="mt-1" />
                    <div>
                      <div className="font-semibold" style={labelStyle}>Use LR Paris freight forwarder</div>
                      <div className="text-sm" style={{ color: design.colors.textLight, fontFamily: design.fonts.bodyFont }}>
                        We&apos;ll arrange shipping through our partner LR Paris
                      </div>
                    </div>
                  </label>
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input type="radio" name="freight" value="own"
                      checked={freightOption === 'own'}
                      onChange={(e) => setFreightOption(e.target.value as 'own')} className="mt-1" />
                    <div>
                      <div className="font-semibold" style={labelStyle}>Use my freight forwarder</div>
                      <div className="text-sm" style={{ color: design.colors.textLight, fontFamily: design.fonts.bodyFont }}>
                        Provide your freight forwarder details below
                      </div>
                    </div>
                  </label>
                  {freightOption === 'own' && (
                    <div className="ml-7 mt-4 space-y-4 border-l-2 pl-4" style={{ borderColor: design.colors.border }}>
                      <Field label="Freight Company Name *">
                        <input type="text" required value={freightCompany} onChange={(e) => setFreightCompany(e.target.value)}
                          className={inputClass} style={inputStyle} />
                      </Field>
                      <Field label="Account Number *">
                        <input type="text" required value={freightAccount} onChange={(e) => setFreightAccount(e.target.value)}
                          className={inputClass} style={inputStyle} />
                      </Field>
                      <Field label="Contact Information *">
                        <input type="text" required value={freightContact} onChange={(e) => setFreightContact(e.target.value)}
                          className={inputClass} style={inputStyle} placeholder="Phone and/or email" />
                      </Field>
                    </div>
                  )}
                </div>
              </Section>
            )}

            {/* 08 — Notes, last */}
            {dr.extra_notes && (
              <Section title="Additional Notes">
                <textarea value={orderNotes} onChange={(e) => setOrderNotes(e.target.value)} rows={4}
                  className={inputClass} style={inputStyle}
                  placeholder={isRequest
                    ? 'Volume, region, any change to branding or specification (optional)'
                    : 'Any special instructions or notes for this order (optional)'} />
              </Section>
            )}

            <button
              type="submit"
              disabled={isSubmitting || presets.shopType === 'stripe'}
              className="w-full py-4 text-white text-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              style={{ backgroundColor: design.colors.secondary, borderRadius: `${design.style.cornerRadius}px`, fontFamily: design.fonts.bodyFont }}
            >
              {isSubmitting
                ? (isRequest ? 'Submitting Request...' : 'Submitting Order...')
                : presets.shopType === 'stripe'
                  ? 'Payment Not Yet Available'
                  : presets.shopType === 'po'
                    ? (isRequest ? 'Submit Request with PO' : 'Submit Order with PO')
                    : (isRequest ? 'Submit Request' : 'Submit Order')}
            </button>
          </form>
        </div>

        {/* Summary */}
        <div>
          <div className="border p-6 sticky top-24" style={sectionStyle}>
            <h2 className="text-2xl font-bold mb-6" style={headingStyle}>
              {isRequest ? 'Request Summary' : 'Order Summary'}
            </h2>

            {presets.shopType !== 'free' && (
              <div className="mb-4 px-3 py-2 rounded text-xs font-semibold uppercase tracking-wide"
                style={{
                  backgroundColor: presets.shopType === 'po' ? `${design.colors.accent}15` : `${design.colors.secondary}15`,
                  color: presets.shopType === 'po' ? design.colors.accent : design.colors.secondary,
                }}>
                {presets.shopType === 'po' ? 'Purchase Order Required' : 'Stripe Payment (Coming Soon)'}
              </div>
            )}

            <div className="space-y-3 mb-6">
              {cart.items.map((item) => (
                <div key={item.productId} className="pb-3 border-b" style={{ borderColor: design.colors.border }}>
                  <div className="font-semibold mb-1" style={{ color: design.colors.text, fontFamily: design.fonts.titleFont }}>
                    {item.productName}
                  </div>
                  <div className="text-sm flex justify-between" style={{ color: design.colors.textLight, fontFamily: design.fonts.bodyFont }}>
                    <span>
                      {item.quantity} box{item.quantity > 1 ? 'es' : ''}
                      {showPrices ? ` × $${item.boxCost.toFixed(2)}` : ''}
                    </span>
                    {showPrices && <span>${(item.boxCost * item.quantity).toFixed(2)}</span>}
                  </div>
                  <div className="text-xs" style={{ color: design.colors.textLight, fontFamily: design.fonts.bodyFont }}>
                    {item.quantity * item.unitsPerBox} total units
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4" style={{ borderColor: design.colors.border }}>
              {showPrices ? (
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold" style={headingStyle}>Total:</span>
                  <span className="text-3xl font-bold" style={{ color: design.colors.secondary, fontFamily: design.fonts.titleFont }}>
                    ${cart.total.toFixed(2)}
                  </span>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold" style={headingStyle}>Total units:</span>
                  <span className="text-3xl font-bold" style={{ color: design.colors.secondary, fontFamily: design.fonts.titleFont }}>
                    {cart.items.reduce((sum, i) => sum + i.quantity * i.unitsPerBox, 0)}
                  </span>
                </div>
              )}
              {!showPrices && (
                <p className="text-xs mt-3" style={{ color: design.colors.textLight, fontFamily: design.fonts.bodyFont }}>
                  Pricing is quoted after approval, based on final volume and region.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
