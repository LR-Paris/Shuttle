# FAQ Folder

## Overview
This folder contains Frequently Asked Questions (FAQ) that appear on the About page. The FAQ content is client-specific and can be customized for each business.

## File Structure

```
FAQ/
├── README.md    # This file
└── FAQ.txt      # FAQ questions and answers
```

## FAQ.txt Format

### Structure

FAQ entries are stored in a simple text format with questions (Q:) and answers (A:):

```
Q: Question text here?
A: Answer text here.

Q: Next question?
A: Next answer.
```

### Format Rules

1. **Question Line:**
   - Starts with `Q:` followed by a space
   - Contains the full question text
   - Can span multiple lines if needed
   - Should end with a question mark

2. **Answer Line:**
   - Starts with `A:` followed by a space
   - Contains the full answer text
   - Can span multiple lines
   - Can include multiple paragraphs
   - Can include contact information, links, etc.

3. **Separation:**
   - Each Q&A pair should be separated by a blank line
   - Multiple paragraphs within an answer are preserved

4. **Special Tokens:**
   - `[W9_LINK]` - Placeholder for W9 document link (replaced in UI)
   - Email addresses (e.g., `s.sacks@lrparis.com`) are automatically converted to clickable mailto links
   - Phone numbers (e.g., `+386 562 8359`) are displayed as text

## Example FAQ.txt

```
Q: Who should I contact for questions?
A: For general questions, please contact Samantha Sacks:
Email: s.sacks@lrparis.com
Phone: +386 562 8359

For finance-related questions:
Email: finance@lrparis.com

Q: What are your payment options?
A: We accept Invoice, ACH, and Wire transfers.

Q: How much does shipping cost?
A: Shipping is calculated based on your location and the items in your order.
```

## Editing FAQ

### To Add a New Question:

1. Open `FAQ.txt` in a text editor
2. Add a blank line after the last FAQ entry
3. Add your new question:
   ```
   Q: Your new question here?
   A: Your answer here.
   ```
4. Save the file
5. Changes appear immediately on next page load

### To Edit an Existing Question:

1. Open `FAQ.txt`
2. Find the question you want to edit
3. Modify the text after `Q:` or `A:`
4. Save the file

### To Remove a Question:

1. Open `FAQ.txt`
2. Delete the entire Q&A pair (including blank lines)
3. Save the file

### To Reorder Questions:

1. Open `FAQ.txt`
2. Cut and paste entire Q&A pairs in desired order
3. Ensure blank lines separate entries
4. Save the file

## Common FAQ Topics

Typical B2B FAQ topics include:

### Contact Information
- Who to contact for general questions
- Who to contact for finance/billing
- Phone numbers and email addresses

### Payment & Invoicing
- How to pay
- Payment methods accepted
- Invoice process
- Tax and shipping inclusion

### Ordering
- Minimum order quantities
- How to place orders
- Custom order process
- Order modifications

### Shipping & Delivery
- Shipping costs
- Delivery timeframes
- International shipping
- Tracking information

### Documentation
- W9 forms
- Banking information
- Certificates of insurance
- Product specifications

## Contact Information Format

When including contact information in answers, use this format:

```
A: Please contact [Name] for [purpose]:
Email: email@domain.com
Phone: +XXX XXX XXXX
```

This format is automatically styled on the About page with:
- Email addresses become clickable mailto links
- Consistent spacing and formatting
- Professional appearance

## Special Placeholders

### [W9_LINK]
Use this placeholder for the W9 document link:
```
Q: Where can I find your W9?
A: Please visit [W9_LINK] to see our W9 and Banking Back up information.
```

The About page will replace this with an actual link.

## Display on Website

FAQ entries are displayed on the About page (`/about`) with:

- Question as heading (larger, bold text)
- Answer as body text below
- Proper spacing between entries
- Email addresses as clickable links
- Professional formatting

## For AI Assistants

### Parsing FAQ.txt:

```typescript
// Read file
const content = fs.readFileSync('DATABASE/Design/FAQ/FAQ.txt', 'utf-8');

// Split into entries
const entries = [];
const lines = content.split('\n');
let currentQuestion = '';
let currentAnswer = '';

for (const line of lines) {
  if (line.startsWith('Q: ')) {
    // Save previous entry if exists
    if (currentQuestion && currentAnswer) {
      entries.push({ question: currentQuestion, answer: currentAnswer });
    }
    currentQuestion = line.substring(3).trim();
    currentAnswer = '';
  } else if (line.startsWith('A: ')) {
    currentAnswer = line.substring(3).trim();
  } else if (currentAnswer) {
    // Continue multi-line answer
    currentAnswer += '\n' + line;
  }
}

// Add last entry
if (currentQuestion && currentAnswer) {
  entries.push({ question: currentQuestion, answer: currentAnswer });
}
```

### FAQ Data Structure:

```typescript
interface FAQEntry {
  question: string;
  answer: string;
}

interface FAQData {
  entries: FAQEntry[];
}
```

### Validation:

- Check that FAQ.txt exists
- Ensure at least one Q&A pair
- Validate Q: and A: prefixes
- Handle empty files gracefully

### Default FAQ:

If FAQ.txt is missing or invalid, provide default FAQ:
```typescript
const defaultFAQ = [
  {
    question: 'How do I place an order?',
    answer: 'Browse our collections, add items to cart, and proceed to checkout.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept Invoice, ACH, and Wire transfers.',
  },
];
```

## Testing Changes

After editing FAQ.txt:

1. Save the file
2. Refresh the About page (`/about`)
3. Verify:
   - All questions appear
   - Answers are formatted correctly
   - Email links work
   - Spacing is correct
   - No parsing errors

## Troubleshooting

**FAQ not appearing?**
- Check FAQ.txt exists in DATABASE/Design/FAQ/
- Verify file format (Q: and A: prefixes)
- Ensure blank lines between entries
- Check for parsing errors in console

**Formatting looks wrong?**
- Verify blank line after each Q&A pair
- Check for extra spaces after Q: or A:
- Ensure multi-line answers continue on new lines

**Email links not working?**
- Ensure email format is correct
- Check for extra spaces around email
- Verify email is in answer text (not question)

## Client Customization

When setting up for a new client:

1. **Update contact information:**
   - Replace email addresses with client's emails
   - Update phone numbers
   - Update contact names

2. **Customize questions:**
   - Add client-specific questions
   - Remove irrelevant questions
   - Adjust wording to match client's terminology

3. **Update answers:**
   - Modify payment terms
   - Update shipping policies
   - Add client-specific processes

4. **Add placeholders:**
   - Use [W9_LINK] for document links
   - Other custom placeholders as needed

## Best Practices

1. **Keep questions concise** - Clear, direct questions
2. **Provide complete answers** - Include all necessary details
3. **Use consistent formatting** - Follow the Q:/A: structure
4. **Include contact info** - Make it easy to reach the right person
5. **Update regularly** - Keep FAQ current with policy changes
6. **Test after changes** - Always verify FAQ displays correctly
7. **Client-specific** - Tailor to each client's needs

## Next Steps

After setting up FAQ:
1. Review and test on About page
2. Ensure all links and emails are correct
3. Verify formatting on different screen sizes
4. Update as business processes change
5. Gather common questions from customers and add them
