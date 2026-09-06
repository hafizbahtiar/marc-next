## Donation module

- [x] Add public `/donate` page with DuitNow QR.
- [x] Copy the shared MARC DuitNow QR asset from Flutter.
- [x] Add QR download action and clarify that QR payments are not recorded automatically.
- [x] Implement web payment checkout for card/Stripe with Stripe Payment Element.
- [x] Add success, processing and failure handling for Stripe web checkout, including redirect returns.
- [x] Include Stripe donations in the existing payment history and receipt flow.
- [ ] Configure the production Stripe publishable key and webhook, then run an end-to-end test payment.
- [ ] Decide whether to add DuitNow/payment reconciliation for manually scanned QR donations.

## Web payment checkout

- [x] Add registration fee checkout action and ToyyibPay redirect on pending approval.
- [x] Handle legacy accounts that require a phone number before checkout.
- [x] Keep payment success authoritative to the backend webhook/status.
- [x] Activity fee checkout is wired from the activity registration flow.
- [x] Add a dedicated payment return/status page for web checkout.
- [x] Add explicit status polling after returning from ToyyibPay.
- [x] Add invoice/caj pemprosesan breakdown to the web checkout UI.
