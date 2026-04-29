import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const DEFAULT_SCHEMA = {
  sections: [
    {
      id: 'contact', title: 'Contact Information', type: 'fields', enabled: true,
      fields: [
        { id: 'firstName', label: 'First Name', type: 'text', required: true, width: 'half', placeholder: '' },
        { id: 'lastName', label: 'Last Name', type: 'text', required: true, width: 'half', placeholder: '' },
        { id: 'email', label: 'Email', type: 'email', required: true, width: 'half', placeholder: '' },
        { id: 'phone', label: 'Phone', type: 'tel', required: true, width: 'half', placeholder: '' },
        { id: 'company', label: 'Company', type: 'text', required: true, width: 'full', placeholder: '' },
        { id: 'country', label: 'Country', type: 'text', required: false, width: 'half', placeholder: 'e.g. United States' },
      ],
    },
    {
      id: 'shipping', title: 'Shipping Address', type: 'fields', enabled: true,
      fields: [
        { id: 'address', label: 'Address', type: 'text', required: true, width: 'full', placeholder: '' },
        { id: 'apt', label: 'Apt, suite, etc.', type: 'text', required: false, width: 'half', placeholder: 'Optional' },
        { id: 'city', label: 'City', type: 'text', required: true, width: 'half', placeholder: '' },
        { id: 'state', label: 'State / Province', type: 'text', required: true, width: 'half', placeholder: '' },
        { id: 'postalCode', label: 'ZIP / Postal Code', type: 'text', required: true, width: 'half', placeholder: '' },
        { id: 'shippingCountry', label: 'Country', type: 'text', required: true, width: 'full', placeholder: 'e.g. United States' },
      ],
    },
    {
      id: 'billing', title: 'Billing Information', type: 'fields', enabled: true,
      fields: [
        { id: 'billingSameAsShipping', label: 'Same as shipping address', type: 'checkbox', required: false, width: 'full', placeholder: '' },
        { id: 'billingName', label: 'Billing Name', type: 'text', required: true, width: 'full', placeholder: '' },
        { id: 'billingAddress', label: 'Billing Address', type: 'text', required: true, width: 'full', placeholder: '' },
        { id: 'billingCity', label: 'City', type: 'text', required: true, width: 'half', placeholder: '' },
        { id: 'billingZip', label: 'ZIP Code', type: 'text', required: true, width: 'half', placeholder: '' },
        { id: 'billingCountry', label: 'Country', type: 'text', required: true, width: 'full', placeholder: '' },
      ],
    },
    {
      id: 'freight', title: 'Freight Options', type: 'freight', enabled: true,
      lrOption: { label: 'Use LR Paris freight forwarder', description: "We'll arrange shipping through our partner LR Paris" },
      ownOption: { label: 'Use my freight forwarder', description: 'Provide your freight forwarder details below' },
      ownFields: [
        { id: 'freightCompany', label: 'Freight Company Name', type: 'text', required: true, width: 'full', placeholder: '' },
        { id: 'freightAccount', label: 'Account Number', type: 'text', required: true, width: 'full', placeholder: '' },
        { id: 'freightContact', label: 'Contact Information', type: 'text', required: true, width: 'full', placeholder: 'Phone and/or email' },
      ],
    },
    {
      id: 'notes', title: 'Order Notes', type: 'fields', enabled: true,
      fields: [
        { id: 'orderNotes', label: 'Order Notes', type: 'textarea', required: false, width: 'full', placeholder: 'Any special instructions or notes for this order (optional)' },
      ],
    },
  ],
};

export async function GET() {
  try {
    const schemaPath = path.join(process.cwd(), 'DATABASE', 'Checkout', 'schema.json');
    if (fs.existsSync(schemaPath)) {
      const data = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
      return NextResponse.json(data);
    }
    return NextResponse.json(DEFAULT_SCHEMA);
  } catch {
    return NextResponse.json(DEFAULT_SCHEMA);
  }
}
