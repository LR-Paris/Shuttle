/**
 * CSV reading helpers for the order log.
 *
 * `DATABASE/Orders/orders.csv` holds shipping and billing addresses as single
 * quoted fields containing newlines, so it cannot be read a line at a time.
 * Both the order-log migrator and the cancel route used `split('\n')` anyway,
 * which turned one order into three records: the migrator then padded the two
 * address fragments with commas and stored them as orders, and the canceller
 * deleted the first line of a record and orphaned the rest. The first live
 * shop's log ended up with rows reading "Test City" and "Test Country" and a
 * header that no longer matched anything.
 *
 * These two functions are the only correct way to read that file.
 */

/** Split CSV text into records, honouring newlines inside quoted fields. */
export function splitCsvRecords(text: string): string[] {
  const records: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"' && text[i + 1] === '"') { current += '""'; i++; continue; }
      if (char === '"') { inQuotes = false; current += char; continue; }
      current += char;
      continue;
    }
    if (char === '"') { inQuotes = true; current += char; continue; }
    if (char === '\r') continue;
    if (char === '\n') { records.push(current); current = ''; continue; }
    current += char;
  }
  if (current !== '') records.push(current);
  return records;
}

/** Split one CSV record into its fields, unescaping doubled quotes. */
export function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"' && line[i + 1] === '"') { current += '"'; i++; }
      else if (char === '"') inQuotes = false;
      else current += char;
    } else {
      if (char === '"') inQuotes = true;
      else if (char === ',') { fields.push(current); current = ''; }
      else current += char;
    }
  }
  fields.push(current);
  return fields;
}
