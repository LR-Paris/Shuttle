/**
 * Order confirmation PDF.
 *
 * Replaces the inline generator that used to live in app/order-success/page.tsx.
 * Two reasons it moved and was rewritten:
 *
 *  - It assembled the file as a JavaScript string and computed xref offsets from
 *    `string.length`. That is fine for text but corrupts binary, so a product
 *    image could never have been embedded. This version assembles an array of
 *    byte chunks and measures real byte lengths.
 *  - The document now carries what ELC asked for: an LR Paris header, a product
 *    image per line, shipping and billing addresses, and no pricing.
 *
 * JPEGs are embedded with /DCTDecode, which stores the original bytes untouched
 * — no decoding or re-encoding, so a 1200x1200 product shot costs what the file
 * already weighs.
 */

export interface PdfOrderItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  imageUrl?: string;
}

export interface PdfOrder {
  orderId: string;
  date: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  brand?: string;
  inHandDate?: string;
  estimatedBudget?: string;
  poNumber?: string;
  shippingAddress?: string;
  billingAddress?: string;
  artLink?: string;
  items: PdfOrderItem[];
}

/** Latin-1: the PDF text we emit is ASCII, and one char maps to one byte. */
function latin1(s: string): Uint8Array {
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i) & 0xff;
  return out;
}

function sanitize(s: string): string {
  return (s ?? '').replace(/[^\x20-\x7E]/g, '');
}

function escapePdfText(s: string): string {
  return sanitize(s).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

/**
 * Read a JPEG's pixel dimensions from its SOF marker.
 *
 * Needed because /Width and /Height are required on the image XObject and the
 * bytes are handed to the PDF undecoded, so nothing else knows the size.
 */
function jpegSize(bytes: Uint8Array): { width: number; height: number } | null {
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;
  let i = 2;
  while (i < bytes.length - 9) {
    if (bytes[i] !== 0xff) { i++; continue; }
    const marker = bytes[i + 1];
    // SOF0..SOF3, SOF5..SOF7, SOF9..SOF11, SOF13..SOF15
    if (marker >= 0xc0 && marker <= 0xcf &&
        marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return {
        height: (bytes[i + 5] << 8) | bytes[i + 6],
        width: (bytes[i + 7] << 8) | bytes[i + 8],
      };
    }
    i += 2 + ((bytes[i + 2] << 8) | bytes[i + 3]);
  }
  return null;
}

async function loadJpeg(url: string): Promise<{ bytes: Uint8Array; width: number; height: number } | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const type = res.headers.get('content-type') || '';
    const bytes = new Uint8Array(await res.arrayBuffer());
    // Only JPEG can be passed through with DCTDecode. A PNG would need its own
    // decode path, so it is skipped rather than shipped as a corrupt image.
    if (!type.includes('jpeg') && !(bytes[0] === 0xff && bytes[1] === 0xd8)) return null;
    const size = jpegSize(bytes);
    if (!size) return null;
    return { bytes, ...size };
  } catch {
    return null;
  }
}

/** Break a string onto lines that fit `max` characters. */
function wrap(s: string, max: number): string[] {
  const words = sanitize(s).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    if (!cur.length) { cur = w; continue; }
    if ((cur + ' ' + w).length <= max) cur += ' ' + w;
    else { lines.push(cur); cur = w; }
  }
  if (cur) lines.push(cur);
  return lines;
}

export async function generateOrderPdf(order: PdfOrder): Promise<Blob> {
  const W = 612, H = 792, M = 50;
  const THUMB = 46;          // points; the row height is driven by this
  let y = H - M;
  let stream = '';

  const text = (s: string, x: number, yp: number, size: number, bold = false) => {
    stream += `BT ${bold ? '/F2' : '/F1'} ${size} Tf ${x} ${yp} Td (${escapePdfText(s)}) Tj ET\n`;
  };
  const line = (x1: number, y1: number, x2: number, y2: number, width = 0.5) => {
    stream += `${width} w ${x1} ${y1} m ${x2} ${y2} l S\n`;
  };
  const gray = (g: number) => { stream += `${g} g\n`; };
  const black = () => { stream += `0 g\n`; };

  // ---------------------------------------------------------------- header
  text('LR PARIS', M, y, 22, true);
  y -= 26;
  text('ORDER CONFIRMATION', M, y, 13, true);
  y -= 14;
  gray(0.35);
  text('This confirms your request was received. It is not an order confirmation.', M, y, 8);
  black();
  y -= 16;
  line(M, y, W - M, y, 1);
  y -= 20;

  // ---------------------------------------------------------------- details
  const label = (k: string, v: string) => {
    if (!v) return;
    text(k, M, y, 9, true);
    text(v, M + 110, y, 9);
    y -= 14;
  };

  const dateStr = new Date(order.date).toLocaleString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  label('Order ID', order.orderId);
  label('Date', dateStr);
  label('Requested by', order.name);
  label('Email', order.email || '');
  label('Phone', order.phone || '');
  label('Company', order.company || '');
  label('Brand', order.brand || '');
  label('In hand date', order.inHandDate || '');
  label('Estimated budget', order.estimatedBudget || '');
  label('PO number', order.poNumber || '');
  if (order.artLink) {
    text('Custom artwork', M, y, 9, true);
    for (const l of wrap(order.artLink, 60)) { text(l, M + 110, y, 9); y -= 12; }
    y -= 2;
  }

  // ---------------------------------------------------------------- addresses
  const addressBlock = (title: string, body: string, x: number) => {
    let ay = y;
    text(title, x, ay, 9, true);
    ay -= 13;
    for (const raw of (body || '').split('\n')) {
      for (const l of wrap(raw, 34)) { text(l, x, ay, 9); ay -= 12; }
    }
    return ay;
  };

  if (order.shippingAddress || order.billingAddress) {
    y -= 8;
    line(M, y, W - M, y);
    y -= 18;
    const leftEnd = addressBlock('Ship to', order.shippingAddress || '', M);
    const rightEnd = addressBlock('Bill to', order.billingAddress || order.shippingAddress || '', M + 270);
    y = Math.min(leftEnd, rightEnd) - 8;
  }

  // ---------------------------------------------------------------- items
  line(M, y, W - M, y);
  y -= 18;
  text('ITEMS REQUESTED', M, y, 10, true);
  y -= 18;
  text('Item', M + THUMB + 12, y, 9, true);
  text('Qty', W - M - 40, y, 9, true);
  y -= 6;
  line(M, y, W - M, y);
  y -= 8;

  // Fetch every thumbnail first so the layout can account for real heights.
  const images = await Promise.all(
    order.items.map(it => (it.imageUrl ? loadJpeg(it.imageUrl) : Promise.resolve(null)))
  );

  const xobjects: { name: string; bytes: Uint8Array; width: number; height: number }[] = [];

  order.items.forEach((item, idx) => {
    const rowTop = y;
    const img = images[idx];

    if (img) {
      const name = `Im${xobjects.length + 1}`;
      xobjects.push({ name, bytes: img.bytes, width: img.width, height: img.height });
      // Fit inside a THUMB square, preserving aspect ratio.
      const scale = Math.min(THUMB / img.width, THUMB / img.height);
      const w = img.width * scale, h = img.height * scale;
      const ix = M + (THUMB - w) / 2;
      const iy = rowTop - THUMB + (THUMB - h) / 2;
      stream += `q ${w.toFixed(2)} 0 0 ${h.toFixed(2)} ${ix.toFixed(2)} ${iy.toFixed(2)} cm /${name} Do Q\n`;
    } else {
      gray(0.9);
      stream += `${M} ${rowTop - THUMB} ${THUMB} ${THUMB} re f\n`;
      black();
    }

    const tx = M + THUMB + 12;
    let ty = rowTop - 12;
    for (const l of wrap(item.productName, 46)) { text(l, tx, ty, 10); ty -= 12; }
    gray(0.35);
    text(`SKU: ${item.sku}`, tx, ty, 8);
    black();
    text(`${item.quantity}`, W - M - 40, rowTop - 12, 10);

    y = Math.min(rowTop - THUMB, ty - 10) - 10;
    gray(0.85);
    line(M, y + 4, W - M, y + 4, 0.4);
    black();
    y -= 8;
  });

  // ---------------------------------------------------------------- footer
  y -= 6;
  const totalUnits = order.items.reduce((s, i) => s + i.quantity, 0);
  text(`Total items: ${order.items.length}`, M, y, 9, true);
  text(`Total units: ${totalUnits}`, M + 150, y, 9, true);
  y -= 26;
  gray(0.35);
  text('Nothing is produced or shipped until specifications, pricing and lead time are', M, y, 8);
  y -= 11;
  text('confirmed in writing. Questions: elcorders@lrparis.com', M, y, 8);
  black();

  // ---------------------------------------------------------------- assemble
  // Byte chunks, not a string: the JPEG payloads are binary and measuring them
  // with string.length would put the xref offsets in the wrong place.
  const imageObjStart = 7;
  const xobjectResources = xobjects.length
    ? ` /XObject << ${xobjects.map((o, i) => `/${o.name} ${imageObjStart + i} 0 R`).join(' ')} >>`
    : '';

  const parts: (string | Uint8Array)[] = [];
  const offsets: number[] = [];
  let pos = 0;
  const push = (chunk: string | Uint8Array) => {
    parts.push(chunk);
    pos += typeof chunk === 'string' ? chunk.length : chunk.length;
  };
  const openObj = () => { offsets.push(pos); };

  push('%PDF-1.4\n');

  openObj(); push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
  openObj(); push('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');
  openObj(); push(
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Contents 4 0 R ` +
    `/Resources << /Font << /F1 5 0 R /F2 6 0 R >>${xobjectResources} >> >>\nendobj\n`
  );
  openObj(); push(`4 0 obj\n<< /Length ${latin1(stream).length} >>\nstream\n${stream}endstream\nendobj\n`);
  openObj(); push('5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n');
  openObj(); push('6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n');

  xobjects.forEach((o, i) => {
    openObj();
    push(
      `${imageObjStart + i} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${o.width} ` +
      `/Height ${o.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 ` +
      `/Filter /DCTDecode /Length ${o.bytes.length} >>\nstream\n`
    );
    push(o.bytes);
    push('\nendstream\nendobj\n');
  });

  const count = offsets.length;
  const xrefStart = pos;
  let xref = `xref\n0 ${count + 1}\n0000000000 65535 f \n`;
  for (const off of offsets) xref += `${off.toString().padStart(10, '0')} 00000 n \n`;
  xref += `trailer\n<< /Size ${count + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  push(xref);

  const bytes = new Uint8Array(pos);
  let at = 0;
  for (const chunk of parts) {
    const b = typeof chunk === 'string' ? latin1(chunk) : chunk;
    bytes.set(b, at);
    at += b.length;
  }

  return new Blob([bytes], { type: 'application/pdf' });
}
