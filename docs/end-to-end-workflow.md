## PayTread — End-to-end Workflow (mapped to code)

Source: developer screenshot (end-to-end payment release flow).

This document maps the high-level workflow in the screenshot to the current repository code, notes what is implemented, what is simulated (sandbox), and recommended next steps to complete the flow for a production-like environment.

## High-level workflow steps (as in the diagram)

1. Shipper: Create Load
2. Select Carrier & Payment Method
3. Schedule Payment (Card / Wallet)
4. Track Shipment
5. Deliver & Upload POD
6. Confirm Delivery / Auto-POD
7. Trigger Payment Release (business rules / margin / split)
8. Payment Engine: Execute Payout
9. Carrier Wallet / Card Funding

Cross-cutting roles:
- Broker: assign carriers, monitor compliance & docs
- Admin: KYC, disputes, override payouts
- Ledger & compliance reporting

---

## Mapping: workflow step → code / model / endpoint

- 1) Shipper: Create Load
  - Data model: `prisma/schema.prisma` → `model Load` contains fields for reference, shipperId, brokerId, carrierId, rateCents, pickup/delivery datetimes, addresses, miles, notes, and status.
  - API: `GET/POST /api/loads` — current debug route `app/api/loads/route.ts` provides a listing endpoint; creating loads endpoint is not yet implemented (you can reuse the `Load` model and add a POST route).

- 2) Select Carrier & Payment Method
  - Data model: `Load.carrierId` plus `Wallet` and `PayoutRequest` models (`prisma/schema.prisma`).
  - UI: `app/debug/page.tsx` and `app/broker/page.tsx` contain links and actions; selection UI is partial and would be implemented in a broker-facing flow.

- 3) Schedule Payment (Card/Wallet)
  - Data model: `PayoutRequest` exists. `Payout` is the executed payment row linked to a `WalletTransaction`.
  - Implementation: Scheduling and card-on-file storage are not implemented; the repo has a sandbox payments adapter at `lib/payments/sandbox.ts` used by `app/api/loads/[loadId]/payouts/route.ts` to immediately simulate settlement.

- 4) Track Shipment
  - Not implemented in the app yet. Could be an event/notification model or third-party tracking integration. The `Notification` model exists in Prisma schema for storing notifications.

- 5) Deliver & Upload POD
  - Data model: `Pod` model exists (fields: `s3Key`, `mime`, `checksum`, `uploadedBy`, `uploadedAt`, `status`).
  - Endpoint: There is not a dedicated file-upload route in this repo; the debug flow simulates a POD created in seed. To support real uploads, add a `POST /api/loads/:loadId/pods` endpoint and S3 uploader logic.

- 6) Confirm Delivery / Auto-POD
  - Endpoint: `POST /api/loads/:loadId/pods/:podId/approve` implemented at `app/api/loads/[loadId]/pods/[podId]/approve/route.ts`.
  - Behavior: Approving a POD creates a `WalletTransaction` credit (LOAD_GROSS) and updates the `Wallet.balanceCents` (previously availableCents). This step is implemented and exercised via debug UI.

- 7) Trigger Payment Release (business rules / margin / split)
  - Business logic: Partially implemented. The payout endpoint checks outstanding balance for a specific load and enforces idempotency and KYC. Splits and margin tracking (broker fees, multi-party splits) are not yet fully modeled — `Advance` and `PayoutRequest` exist and can be extended to support splits.

- 8) Payment Engine: Execute Payout
  - Implementation: `app/api/loads/[loadId]/payouts/route.ts` creates a `Payout` row, debits the `Wallet` using an atomic conditional update, writes an append-only `WalletTransaction` (PARTIAL_PAYOUT), and then calls the sandbox adapter `lib/payments/sandbox.ts` to simulate settlement. On failure it writes a reversal transaction.

- 9) Carrier Wallet / Card Funding
  - Model: `Wallet` and `WalletTransaction` are the ledger and balance store.
  - Implementation: Wallet funding is simulated when a POD is approved (a LOAD_GROSS transaction). External wallet/card funding APIs are not integrated yet.

Cross-cutting features implemented
- KYC (DB-backed): `User.kycStatus` added to the Prisma schema. The payout endpoint enforces `kycStatus === 'VERIFIED'` for the requesting user. `app/api/users/me` returns the DB value.
- Append-only ledger: `WalletTransaction` model is the system-of-record. Failures create reversal transactions rather than mutating prior transactions.
- Sandbox payments adapter: `lib/payments/sandbox.ts` simulates an external rail.
- Debug UI: `app/debug/page.tsx` showcases the flows and provides quick actions (Approve POD, Quick Pay) and now surfaced KYC status and toasts.

## Gaps and recommended action items (to make this E2E robust)

Priority (short-term)
- [ ] Add POST /api/loads to create loads (shipper flow).
- [ ] Add POST /api/loads/:loadId/pods to accept POD uploads (direct-to-S3 signed URLs or multipart).
- [ ] Wire role-based auth (broker/carrier/admin) and replace `requestedBy` email header with authenticated user id.
- [x] (done) DB-backed KYC and server-side gating on payouts.
- [x] (done) Transactional wallet debit pattern and append-only ledger handling (including reversals).

Priority (medium-term)
- [ ] Implement payment scheduling and a queued worker (create Payout row + enqueue job; worker calls real adapter and updates Payout status).
- [ ] Implement splits/margin calculation (a PayoutSplit model or extend Payout with recipients and amounts).
- [ ] Add tracking integration & webhook listeners to auto-trigger POD approvals or alerts.

Priority (long-term / production hardening)
- [ ] Move local dev to Postgres (Docker Compose) to use enums, stronger constraints, and proper transaction semantics.
- [ ] Add integration tests that run a Postgres container and simulate concurrent payouts to validate the debit pattern.
- [ ] Add monitoring and alerting for failed payouts, reconciliation mismatches, and idempotency violations.

## Developer notes & where to start implementing missing pieces

- Add a `POST /api/loads` route: create a minimal handler in `app/api/loads/route.ts` that validates payload (reference, shipperId, rateCents) and calls `prisma.load.create`.
- Add a `POST /api/loads/:id/pods` route: return a signed S3 URL (or accept a mock upload) and create a `pod` row.
- Convert debug UI `requestedBy` usage to use the authenticated user: add a lightweight dev auth middleware that maps `x-user-email` → user.id and injects it into requests; later replace with proper session/JWT.
- Worker and webhooks: create `lib/worker/payments.ts` and an API `app/api/webhooks/payments/route.ts` for settlement callbacks. The worker can use `setTimeout` in dev to simulate asynchronous settlement until you add a real job system.

## Files & endpoints to review when working on this flow

- Data models: `prisma/schema.prisma` (Load, Pod, Wallet, WalletTransaction, Payout, PayoutRequest, Notification, Advance, Rating)
- POD approval: `app/api/loads/[loadId]/pods/[podId]/approve/route.ts`
- Payouts: `app/api/loads/[loadId]/payouts/route.ts`
- Sandbox payments adapter: `lib/payments/sandbox.ts`
- Debug UI: `app/debug/page.tsx`, `app/carrier/page.tsx`, `app/broker/page.tsx`
- KYC endpoint: `app/api/users/me/route.ts`

## Quick-start checklist to exercise the E2E flow locally

1. Ensure DB is up to date:
   ```bash
   npx prisma generate
   npx prisma db push
   npm run seed:js
   ```
2. Start Next dev:
   ```bash
   npm run dev
   ```
3. Use the debug UI at `http://localhost:3000/debug` to:
   - Approve the seeded POD (creates LOAD_GROSS ledger row and funds wallet)
   - Attempt a payout as `broker@example.com` (VERIFIED) — should call sandbox and mark payout SENT
   - Attempt a payout as `carrier@example.com` (UNVERIFIED) — should be blocked by KYC

## Attachments and assets

- The original screenshot is used as the authoritative workflow; include it in the repo (for example `docs/assets/paytread-workflow.png`) if you want to keep visual reference with the docs. I can add this asset and annotate it with links to the codebase if you want.

## Next steps I can implement for you

- Create `POST /api/loads` and `POST /api/loads/:loadId/pods` with a simple S3-signed-url mock (small task).
- Add a small worker and webhook simulation so payouts are processed asynchronously (makes the payment engine behavior closer to production).
- Add integration tests to validate KYC gating and concurrent debit safety.

Tell me which of the next steps you'd like me to implement first and I'll start making the code changes and tests.
