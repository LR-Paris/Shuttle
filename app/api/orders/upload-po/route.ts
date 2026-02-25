import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('po_file') as File | null;
    const orderId = formData.get('order_id') as string | null;

    if (!file || !orderId) {
      return NextResponse.json(
        { error: 'Missing PO file or order ID' },
        { status: 400 }
      );
    }

    // Validate file type - accept PDF, HTML, TXT, and Word documents
    const allowedTypes = [
      'application/pdf',
      'text/html',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    const allowedExtensions = ['.pdf', '.html', '.htm', '.txt', '.doc', '.docx'];
    const fileExtension = path.extname(file.name).toLowerCase();

    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      return NextResponse.json(
        { error: 'Only PDF, HTML, TXT, and Word (.doc/.docx) files are accepted for Purchase Orders' },
        { status: 400 }
      );
    }

    // Sanitize order ID for filename
    const safeOrderId = orderId.replace(/[^a-zA-Z0-9\-_]/g, '');

    const ordersDir = path.join(process.cwd(), 'DATABASE', 'Orders');
    if (!fs.existsSync(ordersDir)) {
      fs.mkdirSync(ordersDir, { recursive: true });
    }

    // Save PO file with its original extension in the Orders folder
    const ext = allowedExtensions.includes(fileExtension) ? fileExtension : '.pdf';
    const filePath = path.join(ordersDir, `${safeOrderId}${ext}`);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(filePath, buffer);

    return NextResponse.json({
      success: true,
      filename: `${safeOrderId}${ext}`,
    });
  } catch (error) {
    console.error('Error uploading PO file:', error);
    return NextResponse.json(
      { error: 'Failed to upload PO file' },
      { status: 500 }
    );
  }
}
