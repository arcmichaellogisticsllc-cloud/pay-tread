// Types and interface for PayTread payment provider implementations.
// All payment provider implementations (including PriorityPaymentsProvider)
// must implement the PaymentsProvider interface below.

export type Currency = 'USD' | string;

export type PayoutMethodType = 'BANK_ACCOUNT' | 'CARD' | 'TOKEN';

export interface PayoutMethodRecord {
  id: string; // local DB id
  ownerId: string;
  type: PayoutMethodType;
  providerToken?: string | null; // token/ID returned by provider
  last4?: string | null;
  meta?: Record<string, unknown> | null;
}

export interface FundingSource {
  id: string;
  ownerId: string;
  providerId: string; // provider-side id
  type: PayoutMethodType;
  currency: Currency;
  last4?: string | null;
  meta?: Record<string, unknown> | null;
}

export interface CreatePayoutParams {
  amountCents: number;
  currency?: Currency;
  destination: { providerToken: string } | { fundingSourceId: string } | { externalAccountId: string };
  idempotencyKey?: string;
  metadata?: Record<string, unknown>;
  referenceId?: string; // e.g., load id
}

export type PayoutStatus = 'REQUESTED' | 'PENDING' | 'SENT' | 'FAILED' | 'REVERSED' | 'CANCELLED';

export interface PayoutResult {
  success: boolean;
  status: PayoutStatus;
  providerPayoutId?: string | null; // id in provider system
  externalPaymentId?: string | null; // provider-side payment identifier
  failureReason?: string | null;
  raw?: Record<string, unknown> | null; // provider raw response for debugging (must not contain PANs)
}

export interface GetPayoutStatusResult {
  status: PayoutStatus;
  providerPayoutId?: string | null;
  externalPaymentId?: string | null;
  failureReason?: string | null;
  raw?: Record<string, unknown> | null;
}

export interface TokenizeBankAccountParams {
  accountNumber: string; // NOTE: implementations MUST NOT persist raw account numbers; tokenization should be done immediately
  routingNumber?: string;
  accountHolderName?: string;
  accountHolderType?: 'individual' | 'company';
}

export interface TokenizeResult {
  token: string; // provider token
  last4?: string | null;
  raw?: Record<string, unknown> | null;
}

export interface PaymentsProviderConfig {
  env?: Record<string, string | undefined>;
  mode?: 'sandbox' | 'production' | 'test';
}

// Webhook event shape for Priority (implementations may extend)
export interface PriorityWebhookEvent {
  id: string;
  type: string;
  createdAt?: string;
  data?: Record<string, unknown>;
}

// Primary provider interface used throughout the app. All outgoing payment
// operations must go through an implementation of this interface.
export interface PaymentsProvider {
  configure(config: PaymentsProviderConfig): Promise<void> | void;

  // Tokenize a bank account or card with the provider. Implementations must
  // ensure raw sensitive details are not stored in the PayTread DB.
  tokenizeBankAccount(params: TokenizeBankAccountParams): Promise<TokenizeResult>;

  // Create a funding source in the provider for later payouts. Returns a provider id/token.
  createFundingSource(ownerId: string, token: string, meta?: Record<string, unknown>): Promise<FundingSource>;

  // Create a payout/disbursement via the provider.
  createPayout(params: CreatePayoutParams): Promise<PayoutResult>;

  // Query status for an existing provider payout id.
  getPayoutStatus(providerPayoutId: string): Promise<GetPayoutStatusResult>;

  // Optional: cancel a pending payout where supported by provider.
  cancelPayout?(providerPayoutId: string): Promise<{ success: boolean; message?: string }>;

  // Validate and parse an incoming webhook payload from Priority.
  verifyAndParseWebhook?(headers: Record<string, string | undefined>, body: unknown): Promise<PriorityWebhookEvent>;

  // Optional helper to map provider webhook events to internal state transitions
  // (e.g., SENT, FAILED, REVERSED). Implementations should return canonicalized info.
  handleWebhookEvent?(evt: PriorityWebhookEvent): Promise<{ type: string; payload: Record<string, unknown> }>;
}

export default PaymentsProvider;
