## Donation module

- [x] Add public `/donate` page with DuitNow QR.
- [x] Copy the shared MARC DuitNow QR asset from Flutter.
- [x] Add QR download action and clarify that QR payments are not recorded automatically.
- [ ] Implement web payment checkout for card/Stripe.
- [ ] Add payment success/cancel handling for web checkout.
- [ ] Add the web donation checkout to payment history and receipt flow.
- [ ] Decide whether to add DuitNow/payment reconciliation for manually scanned QR donations.

## Web payment checkout

- [x] Add registration fee checkout action and ToyyibPay redirect on pending approval.
- [x] Handle legacy accounts that require a phone number before checkout.
- [x] Keep payment success authoritative to the backend webhook/status.
- [x] Activity fee checkout is wired from the activity registration flow.
- [ ] Add a dedicated payment return/status page for web checkout.
- [ ] Add explicit refresh/status polling after returning from ToyyibPay.
- [ ] Add invoice/caj pemprosesan breakdown to the web checkout UI.
