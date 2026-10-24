# GROWSPEC contact form — live Formspree endpoint and verification

Status: **Website source connected to Formspree; real-world delivery verification pending.**

**Endpoint provided by business owner:** `https://formspree.io/f/mnppnngj`
**Notification email to verify inside Formspree dashboard:** `abbas@growspecbio.com`
**Website:** `https://www.growspecbio.com/contact/`

## What is implemented

- `contact/index.html`: form uses `method="POST"`, `action="https://formspree.io/f/mnppnngj"`, and `data-formspree-endpoint="https://formspree.io/f/mnppnngj"`.
- Native HTML POST remains available if website JavaScript fails to load.
- `assets/js/growspec-contact-form-m54.js`: FormData AJAX POST with `Accept: application/json`, in-page success or failure messages, duplicate-submit prevention, and `generate_lead` event on accepted submissions.
- Customer email field uses `name="email"` so Formspree can set Reply-To to the customer's email address.
- Sales WhatsApp `+86 187 1839 6182` and direct `mailto:abbas@growspecbio.com` links remain available.
- Product inquiry links include `?system=...` to preselect product interest.
- Consent and basic honeypot protection are present; Formspree spam filters must also be enabled in the dashboard.

## Owner account settings (must verify)

1. Sign into **https://formspree.io/** under the company-controlled account.
2. Verify the form ID `mnppnngj` belongs to GROWSPEC Project Enquiries.
3. Verify email notifications are enabled and addressed to `abbas@growspecbio.com`. Check that the mailbox is verified if the provider requires confirmation.
4. In your Formspree Project Settings, set **Restrict to Domain** to `growspecbio.com` (without `www`). This covers both the root domain and `www` and protects against submissions from unrelated websites.
5. Keep the provider's spam filtering active. Review any CAPTCHA setting for compatibility with this on-page AJAX form, particularly when submitting from mobile browsers.
6. Do not share account passwords or secret API keys, or put them in website HTML. The form endpoint is public and designed for browser submissions.

## Required end-to-end acceptance test (live)

1. Open `https://www.growspecbio.com/contact/` in a private browser window after GitHub Pages finishes deploying. The primary form button should say **Send Project Enquiry**.
2. Fill out a test enquiry with a real reachable email address. Put **TEST — GROWSPEC form integration** in the project details.
3. Click **Send Project Enquiry** once. Expect a success message only if Formspree accepts the submission.
4. **In Formspree dashboard** confirm the submission is in the correct form (not its Spam section).
5. **In abbas@growspecbio.com mailbox**, confirm the notification arrived. Check Spam/Junk and the reply-to address. If the dashboard lists it but the email is missing, correct email notification settings or spam filters before claiming complete delivery.
6. In a second browser test, submit an intentionally invalid email and verify client-side validation. Test a temporary offline scenario; it must not claim successful submission.
7. Test a quotation link from `/products/biocube-container/` — contact form should automatically select **BioCube Container**.
8. Test both WhatsApp methods: direct button and form-generated prefilled project enquiry. The visitor must press Send in WhatsApp to deliver.

**Do not claim customer enquiries reach the mailbox until both the Formspree dashboard and inbox check succeed.** A successful GitHub commit, a simulated success response, or an endpoint URL is not equivalent to verified email delivery.

## Operational considerations

- Free Formspree plan is suitable for initial GROWSPEC traffic subject to its monthly submission limit and storage retention.
- Review the submission dashboard regularly so an undelivered email notification does not permanently hide a potential sales lead.
- Never submit invented real customer information as a test.
- Use the company-controlled Formspree account and keep data-processing disclosures accurate.
