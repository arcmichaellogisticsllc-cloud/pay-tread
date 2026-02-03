# Security & Compliance — Baseline

This document describes the baseline security and compliance additions made to the dev workspace and recommended follow-ups for production.

## What was added (dev-safe, minimal changes)

- Encrypted POD storage (dev): files uploaded via `app/api/loads/[loadId]/pods/route.ts` are encrypted with AES-256-GCM using `DOCUMENT_ENCRYPTION_KEY` and stored under `data/secure/pods/...`. A secure download endpoint `GET /api/secure/pods?key=<key>` decrypts and streams PDF content after authorization using `getUserFromReq` + `canViewLoad`.

- Access & session logging: a small helper `lib/accessLog.ts` writes access/session events into the existing `AuditLog` table. Key endpoints call `logAccess(...)` on sensitive actions (POD upload, payout creation, payout-method add).

- Credential handling: payout method details are sanitized on create (`app/api/users/me/payout-methods/route.ts`). Common sensitive keys (card PAN, CVV, SSN-like keys) are stripped before being persisted. The `last4` is still stored for UX.

- Role-based data access: secure POD download uses `canViewLoad` to ensure only participants (or admins) may download PODs. Admin endpoints use the existing admin token / ADMIN role checks.

## PCI-related guidance (not fully implemented here)

- Do NOT store card PAN/CVV in your DB. Use a PCI provider (tokenization) — e.g., Stripe, Balanced, or a gateway that returns a reusable token.
- Ensure all payment flows that touch card data run in PCI-compliant environments (hosted fields, tokenization), and card entry points are served over TLS only.
- Rotate encryption keys via a KMS (AWS KMS, GCP KMS). Never store keys in plaintext in the repo.
- For production, move PODs and other sensitive documents to an encrypted object store (S3 with SSE-KMS) and use signed, short-lived URLs for access.

## Environment variables introduced or used

- `DOCUMENT_ENCRYPTION_KEY` — 32-byte string used to encrypt PODs in dev. In production use a KMS-backed key and do not store it in plaintext.
- `ADMIN_TOKEN` — existing admin shared secret used by admin API endpoints.

## Recommendations / Next steps (prioritized)

1. Use a true KMS for key management and secrets (do not supply `DOCUMENT_ENCRYPTION_KEY` in plaintext in production).
2. Persist access logs to a write-once store or central logging system (CloudWatch, Datadog, or ELK) and ensure retention policies meet compliance requirements.
3. Move document storage to S3 with server-side encryption (SSE-KMS) and restrict bucket access.
4. Use tokenization for payout methods and never touch raw PAN/CVV in your servers.
5. Add monitoring and alerting on suspicious AML flags (we added a baseline AML endpoint in `app/api/admin/aml`).
6. Harden admin auth (rotate `ADMIN_TOKEN`, use per-user admin accounts with MFA and session management).

If you want, I can implement one of the next steps now (e.g., move secure PODs to S3-compatible backend with SSE-KMS or add persistent user flags for AML).