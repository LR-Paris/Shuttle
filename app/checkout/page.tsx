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
  };
  hotelList: string[];
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart>({ items: [], total: 0 });
  const [design, setDesign] = useState<DesignData | null>(null);
  const [presets, setPresets] = useState<PresetsData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form fields - Contact (always required: first name, last name)
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');

  // Form fields - Address
  const [address, setAddress] = useState('');
  const [apt, setApt] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [province, setProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // Form fields - Freight
  const [freightOption, setFreightOption] = useState<'lr-paris' | 'own'>('lr-paris');
  const [freightCompany, setFreightCompany] = useState('');
  const [freightAccount, setFreightAccount] = useState('');
  const [freightContact, setFreightContact] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  // STS-2.00 fields - PO
  const [poNumber, setPoNumber] = useState('');
  const [poFile, setPoFile] = useState<File | null>(null);
  const poFileRef = useRef<HTMLInputElement>(null);

  // STS-2.00 fields - Hotel
  const [hotelSelection, setHotelSelection] = useState('');

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
        setPresets(data);
      })
      .catch(() => {
        // If presets endpoint fails (e.g., old Shuttle), default to free shop with all fields
        setPresets({
          shopType: 'free',
          dataRequired: {
            address: true,
            details: true,
            extra_notes: true,
            shipping_handler: true,
            hotel_list: false,
          },
          hotelList: [],
        });
      });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields: name and email
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

      // For PO shop type, validate PO fields
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

      const shippingAddress = presets?.dataRequired.address
        ? `${firstName} ${lastName}\n${address}${apt ? '\n' + apt : ''}\n${city}, ${province} ${postalCode}\n${country}`
        : '';

      const orderData = {
        name: `${firstName} ${lastName}`,
        email,
        phone: presets?.dataRequired.details ? phone : '',
        company: presets?.dataRequired.details ? company : '',
        shippingAddress,
        freightOption: presets?.dataRequired.shipping_handler ? freightOption : '',
        freightCompany: presets?.dataRequired.shipping_handler && freightOption === 'own' ? freightCompany : '',
        freightAccount: presets?.dataRequired.shipping_handler && freightOption === 'own' ? freightAccount : '',
        freightContact: presets?.dataRequired.shipping_handler && freightOption === 'own' ? freightContact : '',
        orderNotes: presets?.dataRequired.extra_notes ? orderNotes : '',
        items: cart.items,
        total: cart.total,
        shopType: presets?.shopType || 'free',
        poNumber: presets?.shopType === 'po' ? poNumber : '',
        hotelSelection: presets?.dataRequired.hotel_list ? hotelSelection : '',
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit order');
      }

      const result = await response.json();

      // Upload PO file if this is a PO shop
      if (presets?.shopType === 'po' && poFile) {
        const formData = new FormData();
        formData.append('po_file', poFile);
        formData.append('order_id', result.orderId);

        const uploadResponse = await fetch('/api/orders/upload-po', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          console.error('Failed to upload PO file, but order was submitted');
        }
      }

      // Save order data for receipt download on success page
      sessionStorage.setItem('lastOrder', JSON.stringify({
        orderId: result.orderId,
        date: new Date().toISOString(),
        name: `${firstName} ${lastName}`,
        company,
        items: cart.items,
        total: cart.total,
        shopType: presets?.shopType || 'free',
        poNumber: presets?.shopType === 'po' ? poNumber : '',
        hotelSelection: presets?.dataRequired.hotel_list ? hotelSelection : '',
      }));

      // Clear cart
      clearCart();
      window.dispatchEvent(new Event('cartUpdated'));

      // Redirect to success page
      router.push(`/order-success?orderId=${result.orderId}`);
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('Failed to submit order. Please try again.');
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

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8" style={{ color: design.colors.primary, fontFamily: design.fonts.titleFont }}>
        Checkout
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Contact Information - always shown (name always required) */}
            <div className="border p-6" style={{ borderColor: design.colors.border, borderRadius: `${design.style.cornerRadius}px` }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: design.colors.primary, fontFamily: design.fonts.titleFont }}>
                Contact Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: design.colors.text, fontFamily: design.fonts.bodyFont }}>
                    First name *
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-2 border focus:outline-none focus:ring-2"
                    style={{ borderColor: design.colors.border, borderRadius: `${design.style.cornerRadius}px`, fontFamily: design.fonts.bodyFont }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: design.colors.text, fontFamily: design.fonts.bodyFont }}>
                    Last name *
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-2 border focus:outline-none focus:ring-2"
                    style={{ borderColor: design.colors.border, borderRadius: `${design.style.cornerRadius}px`, fontFamily: design.fonts.bodyFont }}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-2" style={{ color: design.colors.text, fontFamily: design.fonts.bodyFont }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border focus:outline-none focus:ring-2"
                    style={{ borderColor: design.colors.border, borderRadius: `${design.style.cornerRadius}px`, fontFamily: design.fonts.bodyFont }}
                  />
                </div>
                {dr.details && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: design.colors.text, fontFamily: design.fonts.bodyFont }}>
                        Phone
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-2 border focus:outline-none focus:ring-2"
                        style={{ borderColor: design.colors.border, borderRadius: `${design.style.cornerRadius}px`, fontFamily: design.fonts.bodyFont }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: design.colors.text, fontFamily: design.fonts.bodyFont }}>
                        Company
                      </label>
                      <input
                        type="text"
                        required
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className="w-full px-4 py-2 border focus:outline-none focus:ring-2"
                        style={{ borderColor: design.colors.border, borderRadius: `${design.style.cornerRadius}px`, fontFamily: design.fonts.bodyFont }}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Shipping Address - conditional on address toggle */}
            {dr.address && (
              <div className="border p-6" style={{ borderColor: design.colors.border, borderRadius: `${design.style.cornerRadius}px` }}>
                <h2 className="text-2xl font-bold mb-4" style={{ color: design.colors.primary, fontFamily: design.fonts.titleFont }}>
                  Shipping Address
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold mb-2" style={{ color: design.colors.text, fontFamily: design.fonts.bodyFont }}>
                        Address
                      </label>
                      <input
                        type="text"
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full px-4 py-2 border focus:outline-none focus:ring-2"
                        style={{ borderColor: design.colors.border, borderRadius: `${design.style.cornerRadius}px`, fontFamily: design.fonts.bodyFont }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: design.colors.text, fontFamily: design.fonts.bodyFont }}>
                        Apt, suite, etc. (optional)
                      </label>
                      <input
                        type="text"
                        value={apt}
                        onChange={(e) => setApt(e.target.value)}
                        className="w-full px-4 py-2 border focus:outline-none focus:ring-2"
                        style={{ borderColor: design.colors.border, borderRadius: `${design.style.cornerRadius}px`, fontFamily: design.fonts.bodyFont }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: design.colors.text, fontFamily: design.fonts.bodyFont }}>
                      City
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-4 py-2 border focus:outline-none focus:ring-2"
                      style={{ borderColor: design.colors.border, borderRadius: `${design.style.cornerRadius}px`, fontFamily: design.fonts.bodyFont }}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: design.colors.text, fontFamily: design.fonts.bodyFont }}>
                        Country
                      </label>
                      <input
                        type="text"
                        required
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full px-4 py-2 border focus:outline-none focus:ring-2"
                        style={{ borderColor: design.colors.border, borderRadius: `${design.style.cornerRadius}px`, fontFamily: design.fonts.bodyFont }}
                        placeholder="United States"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: design.colors.text, fontFamily: design.fonts.bodyFont }}>
                        State
                      </label>
                      <input
                        type="text"
                        required
                        value={province}
                        onChange={(e) => setProvince(e.target.value)}
                        className="w-full px-4 py-2 border focus:outline-none focus:ring-2"
                        style={{ borderColor: design.colors.border, borderRadius: `${design.style.cornerRadius}px`, fontFamily: design.fonts.bodyFont }}
                        placeholder="NY"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: design.colors.text, fontFamily: design.fonts.bodyFont }}>
                        ZIP code
                      </label>
                      <input
                        type="text"
                        required
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        className="w-full px-4 py-2 border focus:outline-none focus:ring-2"
                        style={{ borderColor: design.colors.border, borderRadius: `${design.style.cornerRadius}px`, fontFamily: design.fonts.bodyFont }}
                        placeholder="10001"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Hotel Selection - conditional on hotel_list toggle */}
            {dr.hotel_list && (
              <div className="border p-6" style={{ borderColor: design.colors.border, borderRadius: `${design.style.cornerRadius}px` }}>
                <h2 className="text-2xl font-bold mb-4" style={{ color: design.colors.primary, fontFamily: design.fonts.titleFont }}>
                  Hotel Selection
                </h2>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: design.colors.text, fontFamily: design.fonts.bodyFont }}>
                    {presets.hotelList.length > 0 ? 'Select your hotel' : 'Enter your hotel'}
                  </label>
                  {presets.hotelList.length > 0 ? (
                    <select
                      required
                      value={hotelSelection}
                      onChange={(e) => setHotelSelection(e.target.value)}
                      className="w-full px-4 py-2 border focus:outline-none focus:ring-2 bg-white"
                      style={{ borderColor: design.colors.border, borderRadius: `${design.style.cornerRadius}px`, fontFamily: design.fonts.bodyFont }}
                    >
                      <option value="">-- Select a hotel --</option>
                      {presets.hotelList.map((hotel, index) => (
                        <option key={index} value={hotel}>
                          {hotel}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      required
                      value={hotelSelection}
                      onChange={(e) => setHotelSelection(e.target.value)}
                      className="w-full px-4 py-2 border focus:outline-none focus:ring-2"
                      style={{ borderColor: design.colors.border, borderRadius: `${design.style.cornerRadius}px`, fontFamily: design.fonts.bodyFont }}
                      placeholder="Enter your hotel name"
                    />
                  )}
                </div>
              </div>
            )}

            {/* Purchase Order - shown only for PO shop type */}
            {presets.shopType === 'po' && (
              <div className="border p-6" style={{ borderColor: design.colors.border, borderRadius: `${design.style.cornerRadius}px` }}>
                <h2 className="text-2xl font-bold mb-4" style={{ color: design.colors.primary, fontFamily: design.fonts.titleFont }}>
                  Purchase Order
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: design.colors.text, fontFamily: design.fonts.bodyFont }}>
                      PO Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={poNumber}
                      onChange={(e) => setPoNumber(e.target.value)}
                      className="w-full px-4 py-2 border focus:outline-none focus:ring-2"
                      style={{ borderColor: design.colors.border, borderRadius: `${design.style.cornerRadius}px`, fontFamily: design.fonts.bodyFont }}
                      placeholder="Enter your Purchase Order number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: design.colors.text, fontFamily: design.fonts.bodyFont }}>
                      Upload PO Document *
                    </label>
                    <input
                      ref={poFileRef}
                      type="file"
                      required
                      accept=".pdf,.html,.htm,.txt,.doc,.docx,application/pdf,text/html,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={(e) => setPoFile(e.target.files?.[0] || null)}
                      className="w-full px-4 py-2 border focus:outline-none focus:ring-2"
                      style={{ borderColor: design.colors.border, borderRadius: `${design.style.cornerRadius}px`, fontFamily: design.fonts.bodyFont }}
                    />
                    <p className="text-xs mt-1" style={{ color: design.colors.textLight, fontFamily: design.fonts.bodyFont }}>
                      Accepted formats: PDF, HTML, TXT, Word (.doc/.docx)
                    </p>
                  </div>
                  {poFile && (
                    <div className="flex items-center gap-2 text-sm px-3 py-2 rounded" style={{ backgroundColor: `${design.colors.success}15`, color: design.colors.success }}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{poFile.name} ({(poFile.size / 1024).toFixed(1)} KB)</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Stripe placeholder - shown only for stripe shop type */}
            {presets.shopType === 'stripe' && (
              <div className="border p-6" style={{ borderColor: design.colors.border, borderRadius: `${design.style.cornerRadius}px` }}>
                <h2 className="text-2xl font-bold mb-4" style={{ color: design.colors.primary, fontFamily: design.fonts.titleFont }}>
                  Payment
                </h2>
                <div className="text-center py-8" style={{ color: design.colors.textLight, fontFamily: design.fonts.bodyFont }}>
                  <p className="text-lg font-semibold mb-2">Stripe Payment Integration</p>
                  <p>Coming soon. This shop is not yet configured for payments.</p>
                </div>
              </div>
            )}

            {/* Freight Options - conditional on shipping_handler toggle */}
            {dr.shipping_handler && (
              <div className="border p-6" style={{ borderColor: design.colors.border, borderRadius: `${design.style.cornerRadius}px` }}>
                <h2 className="text-2xl font-bold mb-4" style={{ color: design.colors.primary, fontFamily: design.fonts.titleFont }}>
                  Freight Options
                </h2>

                <div className="space-y-4">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="freight"
                      value="lr-paris"
                      checked={freightOption === 'lr-paris'}
                      onChange={(e) => setFreightOption(e.target.value as 'lr-paris')}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-semibold" style={{ color: design.colors.text, fontFamily: design.fonts.bodyFont }}>
                        Use LR Paris freight forwarder
                      </div>
                      <div className="text-sm" style={{ color: design.colors.textLight, fontFamily: design.fonts.bodyFont }}>
                        We&apos;ll arrange shipping through our partner LR Paris
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="freight"
                      value="own"
                      checked={freightOption === 'own'}
                      onChange={(e) => setFreightOption(e.target.value as 'own')}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-semibold" style={{ color: design.colors.text, fontFamily: design.fonts.bodyFont }}>
                        Use my freight forwarder
                      </div>
                      <div className="text-sm" style={{ color: design.colors.textLight, fontFamily: design.fonts.bodyFont }}>
                        Provide your freight forwarder details below
                      </div>
                    </div>
                  </label>

                  {freightOption === 'own' && (
                    <div className="ml-7 mt-4 space-y-4 border-l-2 pl-4" style={{ borderColor: design.colors.border }}>
                      <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: design.colors.text, fontFamily: design.fonts.bodyFont }}>
                          Freight Company Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={freightCompany}
                          onChange={(e) => setFreightCompany(e.target.value)}
                          className="w-full px-4 py-2 border focus:outline-none focus:ring-2"
                          style={{ borderColor: design.colors.border, borderRadius: `${design.style.cornerRadius}px`, fontFamily: design.fonts.bodyFont }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: design.colors.text, fontFamily: design.fonts.bodyFont }}>
                          Account Number *
                        </label>
                        <input
                          type="text"
                          required
                          value={freightAccount}
                          onChange={(e) => setFreightAccount(e.target.value)}
                          className="w-full px-4 py-2 border focus:outline-none focus:ring-2"
                          style={{ borderColor: design.colors.border, borderRadius: `${design.style.cornerRadius}px`, fontFamily: design.fonts.bodyFont }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: design.colors.text, fontFamily: design.fonts.bodyFont }}>
                          Contact Information *
                        </label>
                        <input
                          type="text"
                          required
                          value={freightContact}
                          onChange={(e) => setFreightContact(e.target.value)}
                          className="w-full px-4 py-2 border focus:outline-none focus:ring-2"
                          style={{ borderColor: design.colors.border, borderRadius: `${design.style.cornerRadius}px`, fontFamily: design.fonts.bodyFont }}
                          placeholder="Phone and/or email"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Order Notes - conditional on extra_notes toggle */}
            {dr.extra_notes && (
              <div className="border p-6" style={{ borderColor: design.colors.border, borderRadius: `${design.style.cornerRadius}px` }}>
                <h2 className="text-2xl font-bold mb-4" style={{ color: design.colors.primary, fontFamily: design.fonts.titleFont }}>
                  Order Notes
                </h2>
                <textarea
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border focus:outline-none focus:ring-2"
                  style={{ borderColor: design.colors.border, borderRadius: `${design.style.cornerRadius}px`, fontFamily: design.fonts.bodyFont }}
                  placeholder="Any special instructions or notes for this order (optional)"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || presets.shopType === 'stripe'}
              className="w-full py-4 text-white text-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              style={{ backgroundColor: design.colors.secondary, borderRadius: `${design.style.cornerRadius}px`, fontFamily: design.fonts.bodyFont }}
            >
              {isSubmitting
                ? 'Submitting Order...'
                : presets.shopType === 'po'
                  ? 'Submit Order with PO'
                  : presets.shopType === 'stripe'
                    ? 'Payment Not Yet Available'
                    : 'Submit Order'}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div>
          <div
            className="border p-6 sticky top-24"
            style={{ borderColor: design.colors.border, borderRadius: `${design.style.cornerRadius}px` }}
          >
            <h2 className="text-2xl font-bold mb-6" style={{ color: design.colors.primary, fontFamily: design.fonts.titleFont }}>
              Order Summary
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
                    <span>{item.quantity} box{item.quantity > 1 ? 'es' : ''} × ${item.boxCost.toFixed(2)}</span>
                    <span>${(item.boxCost * item.quantity).toFixed(2)}</span>
                  </div>
                  <div className="text-xs" style={{ color: design.colors.textLight, fontFamily: design.fonts.bodyFont }}>
                    {item.quantity * item.unitsPerBox} total units
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4" style={{ borderColor: design.colors.border }}>
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold" style={{ color: design.colors.primary, fontFamily: design.fonts.titleFont }}>
                  Total:
                </span>
                <span className="text-3xl font-bold" style={{ color: design.colors.secondary, fontFamily: design.fonts.titleFont }}>
                  ${cart.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
