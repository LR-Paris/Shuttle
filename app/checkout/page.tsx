'use client';

import { useState, useEffect } from 'react';
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

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart>({ items: [], total: 0 });
  const [design, setDesign] = useState<DesignData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form fields - Contact
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
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const shippingAddress = `${firstName} ${lastName}\n${address}${apt ? '\n' + apt : ''}\n${city}, ${province} ${postalCode}\n${country}`;

      const orderData = {
        name: `${firstName} ${lastName}`,
        email,
        phone,
        company,
        shippingAddress,
        freightOption,
        freightCompany: freightOption === 'own' ? freightCompany : '',
        freightAccount: freightOption === 'own' ? freightAccount : '',
        freightContact: freightOption === 'own' ? freightContact : '',
        orderNotes,
        items: cart.items,
        total: cart.total,
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

  if (!design) {
    return (
      <div className="container mx-auto px-4 py-12">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8" style={{ color: design.colors.primary, fontFamily: design.fonts.titleFont }}>
        Checkout
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Contact Information */}
            <div className="border p-6" style={{ borderColor: design.colors.border, borderRadius: `${design.style.cornerRadius}px` }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: design.colors.primary, fontFamily: design.fonts.titleFont }}>
                Contact Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: design.colors.text, fontFamily: design.fonts.bodyFont }}>
                    First name
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
                    Last name
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
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: design.colors.text, fontFamily: design.fonts.bodyFont }}>
                    Email
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
                <div className="md:col-span-2">
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
              </div>
            </div>

            {/* Shipping Address */}
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

            {/* Freight Options */}
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
                      We'll arrange shipping through our partner LR Paris
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

            {/* Order Notes */}
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

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 text-white text-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              style={{ backgroundColor: design.colors.secondary, borderRadius: `${design.style.cornerRadius}px`, fontFamily: design.fonts.bodyFont }}
            >
              {isSubmitting ? 'Submitting Order...' : 'Submit Order'}
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
