
# Contact Page with Postmark Email Integration

## Overview
Create a `/contact` page with a form that, on submit, sends **two emails** via Postmark:
1. **Content email** to `talk@ackinax.com` with the form details
2. **Confirmation email** to the person who filled out the form, acknowledging receipt

## Setup Required
Before building, you'll need a **Postmark** account:
1. Sign up at [postmarkapp.com](https://postmarkapp.com)
2. Create a Server and get the **Server API Token**
3. Verify a **Sender Signature** for `talk@ackinax.com` (or your chosen "from" address) in Postmark
4. Provide the API token when prompted

## What Will Be Built

### 1. Contact Page (`src/pages/Contact.tsx`)
- Matches existing site style (Navbar, Footer, grid background, glow effects)
- Form fields: Name, Email, Subject, Message
- Client-side validation with zod (required fields, email format, length limits)
- Loading spinner on submit, success/error toast notifications

### 2. Backend Function (`supabase/functions/send-contact-email/index.ts`)
- Receives form data via POST
- Validates inputs server-side
- Sends **two Postmark API calls**:
  - **Email 1** -- to `talk@ackinax.com` with the contact form content and reply-to set to the sender's email
  - **Email 2** -- confirmation to the form submitter thanking them and letting them know the team will respond soon
- Returns success/error with CORS headers
- JWT verification disabled (public form)

### 3. Route (`src/App.tsx`)
- Add `/contact` route

### 4. Navigation (`src/components/Navbar.tsx`)
- Add "Contact" link to navbar

### 5. Footer Update (`src/components/Footer.tsx`)
- Update existing "Contact" mailto link to point to `/contact` page instead

## Technical Details

**Secret needed:** `POSTMARK_SERVER_TOKEN` -- you'll be prompted to enter this.

**Validation schema (zod):**
- name: required, trimmed, max 100 chars
- email: required, valid email, max 255 chars
- subject: required, trimmed, max 200 chars
- message: required, trimmed, max 2000 chars

**Edge function email flow:**
```text
User submits form
       |
  POST to edge function
       |
  Server-side validation
       |
  +----+----+
  |         |
Email 1   Email 2
Content   Confirmation
to talk@  to submitter
ackinax
```

**Email 1 (to talk@ackinax.com):**
- From: `Ackinax Contact <talk@ackinax.com>`
- Subject: `[Contact Form] {subject}`
- Body: Name, email, subject, message
- ReplyTo: submitter's email

**Email 2 (to submitter):**
- From: `Ackinax <talk@ackinax.com>`
- Subject: `We received your message`
- Body: Friendly confirmation with their name, letting them know the team will be in touch
