# GROWSPEC Website — Direct Enquiry Delivery Activation

The website contact form is prepared for Formspree, but **online submission is NOT enabled** until a verified Formspree endpoint is added. Until then, the form opens an email draft and offers prefilled WhatsApp. Do not describe direct form delivery as live before testing.

## One-time setup (business owner)

1. Sign up or sign in at https://formspree.io/ with **abbas@growspecbio.com**. Verify the account.
2. Create a new form named **GROWSPEC Project Enquiries**.
3. Set and verify **abbas@growspecbio.com** as its target notification email. Enable email notifications.
4. In the form's **Integration** tab, copy the actual HTTPS endpoint, usually in the format `https://formspree.io/f/XXXXXXXX`.
5. In `contact/index.html`, replace the empty `data-formspree-endpoint=""` value on the existing form with the verified endpoint. **Never place account passwords, dashboard tokens, SMTP credentials or API secret keys in the HTML/JavaScript.** The public form endpoint alone is safe to embed.
6. In Formspree settings, enable **Restrict to Domain** for `www.growspecbio.com` (and `growspecbio.com` if applicable). Keep spam filtering enabled. Our form also sends Formspree's `_gotcha` honeypot.
7. Wait for GitHub Pages to publish the change and test from the live website URL.

## Required acceptance tests

- Open `https://www.growspecbio.com/contact/` in desktop and mobile browsers. With a configured endpoint, the primary button should read **Send Project Enquiry**. Without one it should read **Prepare Email Enquiry**.
- From `/products/biocube-container/`, use a quotation button. Confirm the contact form preselects **BioCube Container**. Repeat for the other products.
- Submit one clearly labeled test enquiry. It must: (1) show the on-page success message, (2) appear in Formspree's **Submissions** dashboard, and (3) arrive at **abbas@growspecbio.com**. Check the email junk folder as well. **All three** must pass before declaring email delivery live.
- Check required-field validation, malformed email, duplicate-click prevention, and that a network failure never displays a success message.
- Test the direct WhatsApp link and the form's **Send via WhatsApp** option. The visitor must still press Send in WhatsApp.
- Make sure the consent wording and form-provider disclosure fit GROWSPEC's privacy policy and legal obligations.

## Code and behavior

- Form markup + endpoint: `contact/index.html`.
- Submission logic: `assets/js/growspec-contact-form-m54.js`. Versioned script URL `?v=m65` avoids old-browser caching.
- Direct mode: FormData POST to the verified Formspree endpoint with `Accept: application/json`; show success only for a successful server response. On failure, preserve entered data and show safe fallback guidance.
- Unconfigured mode: prepare an email draft via `mailto:`; no claim of direct web delivery.
- The product-interest query parameter `?system=...` prefills the form.
- Track `generate_lead` only after a confirmed server-accepted form submission; don't equate a WhatsApp click with a sent message.
- Free Formspree plan currently allows 50 submissions per month and retains 30 days of submission history. Review plan limits if lead volume rises.

## Operational checks

Review Formspree submissions and mailbox regularly; missed notifications can be recovered from the dashboard during its retention period. Use an official company-controlled account. Do not publish customer enquiry data or share dashboard credentials.
