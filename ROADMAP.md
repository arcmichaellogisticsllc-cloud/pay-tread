# PayTread Product Roadmap

## MVP → Phase 2 → Phase 3

This roadmap defines the intentional progression of PayTread from a
payments MVP into a full financial operating system for freight.

The goal is controlled expansion without rework, scope creep, or
regulatory risk.

---

## Phase 1 — MVP (Core Platform Launch)

### Objective
Deliver fast, auditable freight payments with integrated accounting.
Replace factoring for speed and transparency.

### Success Criteria
- Carrier paid < 24 hours after POD
- Broker completes payout without manual reconciliation
- Load-level ledger reconciles cleanly
- Repeat usage occurs without support intervention

---

### Phase 1 Features (LOCKED)

#### Payments
- Load creation & assignment
- Proof of Delivery (POD) upload
- POD approval / rejection workflow
- Instant payout (push-to-debit / RTP)
- Standard ACH payout
- Partial payments per load
- Broker-funded early pay (non-lending)

#### Carrier Experience
- Wallet (available vs pending balance)
- Transaction history
- Payout method management
- Optional debit card (cleared funds only)

#### Broker / Shipper Experience
- Payables dashboard
- Batch approvals
- Load-level payment visibility
- Funding source management

#### Accounting & Ledger
- Immutable load-level ledger
- Partial payment reconciliation
- Advance reconciliation
- Carrier exports (CSV / QuickBooks)
- Broker exports (GL-ready)
- 1099-ready summaries

#### Platform & Security
- Multi-role auth (Carrier, Broker, Dispatcher, Admin)
- Role-based access control (RBAC)
- Admin risk controls (freeze, override)
- Notifications & receipts
- Audit logs

#### Distribution
- Manual onboarding
- CSV imports
- Webhook-based interoperability
- No deep TMS integrations yet

---

## Phase 1.5 — Scale & Optimization

### Objective
Increase throughput, stickiness, and operational leverage
without altering core payment logic.

### Enhancements

#### Payments & UX
- Faster payout confirmations
- Improved partial-payment UX
- Retry & failure handling
- Batch payout optimizations

#### Accounting & Reporting
- Scheduled exports
- Period-based close tooling
- Carrier fee vs net breakdown
- Custom report filters

#### Growth & Onboarding
- Broker invite flows
- Carrier self-invite
- In-app onboarding checklist
- Improved docs & help center

---

## Phase 2 — Embedded Financial Products

### Objective
Monetize trust and volume using data generated in Phase 1.
Remain capital-light and compliant.

---

### Phase 2 Features

#### Structured Advances (Optional Credit Layer)
- Dynamic advance limits based on history
- Behavior-based pricing
- Partner-funded initially
- Optional balance-sheet exposure later

#### Carrier Cards (Expanded)
- Physical + virtual cards
- Fuel-focused spend controls
- Category-level restrictions
- Interchange monetization

#### Subscriptions
- Broker tiers
- Fleet plans
- Premium reporting
- Priority settlement windows

#### TMS Integrations (Selective)
- Read/write load sync
- Automated POD ingestion
- Event-driven payment triggers
- No open API marketplace

---

## Phase 3 — Platform & Network Effects

### Objective
Become the default freight settlement layer.

### Expansion
- Shipper-direct payments
- Multi-party settlements
- Cross-border payouts
- Compliance automation

### Network Effects
- Broker preference → carrier adoption
- Carrier preference → broker pressure
- Embedded in daily freight workflows
- PayTread becomes infrastructure

---

## Guiding Principles

- Payments first, credit later
- Ledger is the system of record
- Data precedes underwriting
- Integrations are business decisions
- Avoid re-architecture at all costs

---

## Roadmap Summary

Phase 1: Prove speed + trust  
Phase 2: Monetize data + behavior  
Phase 3: Build the network moat
