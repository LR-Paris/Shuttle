'use client';

import { apiFetch } from '@/lib/api';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCart, clearCart, type Cart } from '@/lib/cart';

interface FieldDef {
  id: string;
  label: string;
  type: string;
  required: boolean;
  width: 'half' | 'full';
  placeholder?: string;
  options?: string[];
}

interface FreightSection {
  id: string;
  title: string;
  type: 'freight';
  enabled: boolean;
  lrOption: { label: string; description: string };
  ownOption: { label: string; description: string };
  ownFields: FieldDef[];
}

interface FieldsSection {
  id: string;
  title: string;
  type: 'fields';
  enabled: boolean;
  fields: FieldDef[];
}

type Section = FieldsSection | FreightSection;

interface CheckoutSchema {
  sections: Section[];
}

interface DesignData {
  colors: { primary: string; secondary: string; accent: string; background: string; text: string; textLight: string; border: string; success: string };
  fonts: { titleFont: string; bodyFont: string };
  style: { cornerRadius: number };
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart>({ items: [], total: 0 });
  const [design, setDesign] = useState<DesignData | null>(null);
  const [schema, setSchema] = useState<CheckoutSchema | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // All form values keyed by field id
  const [values, setValues] = useState<Record<string, string>>({});
  const [checkboxes, setCheckboxes] = useState<Record<string, boolean>>({});
  const [freightOption, setFreightOption] = useState<'lr-paris' | 'own'>('lr-paris');

  useEffect(() => {
    const currentCart = getCart();
    if (currentCart.items.length === 0) { router.push('/cart'); return; }
    setCart(currentCart);
    apiFetch('/design').then(r => r.json()).then(setDesign).catch(console.error);
    apiFetch('/checkout-schema').then(r => r.json()).then(setSchema).catch(console.error);
  }, [router]);

  const setValue = (id: string, val: string) => setValues(prev => ({ ...prev, [id]: val }));
  const setCheckbox = (id: string, val: boolean) => {
    setCheckboxes(prev => ({ ...prev, [id]: val }));
    // Billing same-as-shipping: mirror values
    if (id === 'billingSameAsShipping' && val) {
      setValues(prev => ({
        ...prev,
        billingName: `${prev.firstName || ''} ${prev.lastName || ''}`.trim(),
        billingAddress: prev.address || '',
        billingCity: prev.city || '',
        billingZip: prev.postalCode || '',
        billingCountry: prev.shippingCountry || '',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const shippingAddress = [
        values.address,
        values.apt,
        `${values.city || ''}, ${values.state || ''} ${values.postalCode || ''}`.trim(),
        values.shippingCountry,
      ].filter(Boolean).join('\n');

      // Custom fields = all non-standard values
      const standardKeys = new Set(['firstName','lastName','email','phone','company','country','address','apt','city','state','postalCode','shippingCountry','orderNotes']);
      const customFields: Record<string, string | boolean> = {};
      Object.entries(values).forEach(([k, v]) => { if (!standardKeys.has(k)) customFields[k] = v; });
      Object.entries(checkboxes).forEach(([k, v]) => { customFields[k] = v; });

      const orderData = {
        name: `${values.firstName || ''} ${values.lastName || ''}`.trim(),
        email: values.email || '',
        phone: values.phone || '',
        company: values.company || '',
        country: values.country || '',
        shippingAddress,
        freightOption,
        freightCompany: freightOption === 'own' ? values.freightCompany || '' : '',
        freightAccount: freightOption === 'own' ? values.freightAccount || '' : '',
        freightContact: freightOption === 'own' ? values.freightContact || '' : '',
        orderNotes: values.orderNotes || '',
        customFields,
        items: cart.items,
        total: cart.total,
      };

      const response = await apiFetch('/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      if (!response.ok) throw new Error('Failed to submit order');
      const result = await response.json();

      sessionStorage.setItem('lastOrder', JSON.stringify({
        orderId: result.orderId,
        date: new Date().toISOString(),
        name: orderData.name,
        company: values.company,
        items: cart.items,
        total: cart.total,
      }));

      clearCart();
      window.dispatchEvent(new Event('cartUpdated'));
      router.push(`/order-success?orderId=${result.orderId}`);
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('Failed to submit order. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (!design || !schema) {
    return <div className="container mx-auto px-4 py-12"><p>Loading...</p></div>;
  }

  const r = design.style.cornerRadius;
  const borderStyle = { borderColor: design.colors.border, borderRadius: `${r}px` };
  const inputClass = 'w-full px-4 py-2 border focus:outline-none focus:ring-2';
  const inputStyle = { borderColor: design.colors.border, borderRadius: `${r}px`, fontFamily: design.fonts.bodyFont };
  const labelStyle = { color: design.colors.text, fontFamily: design.fonts.bodyFont };
  const h2Style = { color: design.colors.primary, fontFamily: design.fonts.titleFont };

  const renderField = (field: FieldDef, section?: FieldsSection) => {
    const isBillingSame = checkboxes.billingSameAsShipping;
    const isBillingField = section?.id === 'billing' && field.id !== 'billingSameAsShipping';
    const disabled = isBillingField && isBillingSame;

    if (field.type === 'description') {
      return (
        <div key={field.id} className={field.width === 'full' ? 'col-span-2' : ''}>
          <p className="text-sm py-1 whitespace-pre-wrap" style={{ color: design.colors.textLight, fontFamily: design.fonts.bodyFont }}>{field.label}</p>
        </div>
      );
    }

    if (field.type === 'checkbox') {
      return (
        <div key={field.id} className={field.width === 'full' ? 'col-span-2' : ''}>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={!!checkboxes[field.id]}
              onChange={e => setCheckbox(field.id, e.target.checked)}
              className="rounded border-gray-300 accent-current"
            />
            <span className="text-sm font-semibold" style={labelStyle}>{field.label}</span>
          </label>
        </div>
      );
    }

    if (field.type === 'textarea') {
      return (
        <div key={field.id} className={field.width === 'full' ? 'col-span-2' : ''}>
          <label className="block text-sm font-semibold mb-2" style={labelStyle}>{field.label}</label>
          <textarea
            required={field.required}
            value={values[field.id] || ''}
            onChange={e => setValue(field.id, e.target.value)}
            placeholder={field.placeholder}
            rows={4}
            className={inputClass}
            style={inputStyle}
          />
        </div>
      );
    }

    if (field.type === 'select' && field.options) {
      return (
        <div key={field.id} className={field.width === 'full' ? 'col-span-2' : ''}>
          <label className="block text-sm font-semibold mb-2" style={labelStyle}>{field.label}{field.required ? '' : ' (optional)'}</label>
          <select
            required={field.required}
            value={values[field.id] || ''}
            onChange={e => setValue(field.id, e.target.value)}
            className={inputClass}
            style={inputStyle}
          >
            <option value="">Select...</option>
            {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
      );
    }

    return (
      <div key={field.id} className={field.width === 'full' ? 'col-span-2' : ''}>
        <label className="block text-sm font-semibold mb-2" style={labelStyle}>
          {field.label}{!field.required && ' (optional)'}
        </label>
        <input
          type={field.type}
          required={field.required && !disabled}
          disabled={disabled}
          value={values[field.id] || ''}
          onChange={e => setValue(field.id, e.target.value)}
          placeholder={field.placeholder}
          className={`${inputClass} disabled:opacity-50`}
          style={inputStyle}
        />
      </div>
    );
  };

  const renderSection = (section: Section) => {
    if (!section.enabled) return null;

    if (section.type === 'freight') {
      const fs = section as FreightSection;
      return (
        <div key={section.id} className="border p-6" style={borderStyle}>
          <h2 className="text-2xl font-bold mb-4" style={h2Style}>{section.title}</h2>
          <div className="space-y-4">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input type="radio" name="freight" value="lr-paris" checked={freightOption === 'lr-paris'} onChange={() => setFreightOption('lr-paris')} className="mt-1" />
              <div>
                <div className="font-semibold" style={labelStyle}>{fs.lrOption.label}</div>
                <div className="text-sm" style={{ color: design.colors.textLight, fontFamily: design.fonts.bodyFont }}>{fs.lrOption.description}</div>
              </div>
            </label>
            <label className="flex items-start space-x-3 cursor-pointer">
              <input type="radio" name="freight" value="own" checked={freightOption === 'own'} onChange={() => setFreightOption('own')} className="mt-1" />
              <div>
                <div className="font-semibold" style={labelStyle}>{fs.ownOption.label}</div>
                <div className="text-sm" style={{ color: design.colors.textLight, fontFamily: design.fonts.bodyFont }}>{fs.ownOption.description}</div>
              </div>
            </label>
            {freightOption === 'own' && (
              <div className="ml-7 mt-4 space-y-4 border-l-2 pl-4" style={{ borderColor: design.colors.border }}>
                {fs.ownFields.map(field => (
                  <div key={field.id}>
                    <label className="block text-sm font-semibold mb-2" style={labelStyle}>{field.label} *</label>
                    <input
                      type={field.type}
                      required
                      value={values[field.id] || ''}
                      onChange={e => setValue(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      className={inputClass}
                      style={inputStyle}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    // Standard fields section
    const fs = section as FieldsSection;
    return (
      <div key={section.id} className="border p-6" style={borderStyle}>
        <h2 className="text-2xl font-bold mb-4" style={h2Style}>{section.title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fs.fields.map(field => renderField(field, fs))}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8" style={{ color: design.colors.primary, fontFamily: design.fonts.titleFont }}>
        Checkout
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {schema.sections.map(renderSection)}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 text-white text-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              style={{ backgroundColor: design.colors.secondary, borderRadius: `${r}px`, fontFamily: design.fonts.bodyFont }}
            >
              {isSubmitting ? 'Submitting Order...' : 'Submit Order'}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div>
          <div className="border p-6 sticky top-24" style={borderStyle}>
            <h2 className="text-2xl font-bold mb-6" style={h2Style}>Order Summary</h2>
            <div className="space-y-3 mb-6">
              {cart.items.map(item => (
                <div key={item.productId} className="pb-3 border-b" style={{ borderColor: design.colors.border }}>
                  <div className="font-semibold mb-1" style={{ color: design.colors.text, fontFamily: design.fonts.titleFont }}>{item.productName}</div>
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
                <span className="text-xl font-bold" style={{ color: design.colors.primary, fontFamily: design.fonts.titleFont }}>Total:</span>
                <span className="text-3xl font-bold" style={{ color: design.colors.secondary, fontFamily: design.fonts.titleFont }}>${cart.total.toFixed(2)}</span>
              </div>
              <p className="text-xs mt-1 text-right" style={{ color: design.colors.textLight, fontFamily: design.fonts.bodyFont }}>Does not include shipping and taxes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
