// Option sets derived from /Users/User/Downloads/paytread_data_types.csv
// These are implemented as string literal unions and runtime validators
// so they remain SQLite-compatible while giving TypeScript safety.

export const LoadStatus = [
  'Draft',
  'Posted',
  'Offered',
  'Accepted',
  'EnRoute',
  'Arrived',
  'Unloading',
  'Completed',
  'Canceled'
] as const;
export type LoadStatus = (typeof LoadStatus)[number];
export const isLoadStatus = (v: unknown): v is LoadStatus => typeof v === 'string' && (LoadStatus as readonly string[]).includes(v as string);
// label, order and default color per provided option set
export const LoadStatusMeta: Record<LoadStatus, { label: string; order: number; color: string }> = {
  Draft: { label: 'Draft', order: 1, color: '#9CA3AF' },
  Posted: { label: 'Posted', order: 2, color: '#60A5FA' },
  Offered: { label: 'Offered', order: 3, color: '#34D399' },
  Accepted: { label: 'Accepted', order: 4, color: '#10B981' },
  EnRoute: { label: 'En route', order: 5, color: '#F59E0B' },
  Arrived: { label: 'Arrived', order: 6, color: '#F59E0B' },
  Unloading: { label: 'Unloading', order: 7, color: '#F59E0B' },
  Completed: { label: 'Completed', order: 8, color: '#22C55E' },
  Canceled: { label: 'Canceled', order: 9, color: '#EF4444' }
};

export const AssetType = ['TRACTOR', 'TRAILER', 'CONTAINER', 'VAN', 'REEFER', 'OTHER'] as const;
export type AssetType = (typeof AssetType)[number];
export const isAssetType = (v: unknown): v is AssetType => typeof v === 'string' && (AssetType as readonly string[]).includes(v as string);
export const AssetTypeMeta: Record<AssetType, { label: string; order: number; color: string }> = {
  TRACTOR: { label: 'Tractor', order: 1, color: '#60A5FA' },
  TRAILER: { label: 'Trailer', order: 2, color: '#34D399' },
  CONTAINER: { label: 'BoxTruck', order: 3, color: '#22C55E' },
  VAN: { label: 'SprinterVan', order: 4, color: '#A78BFA' },
  REEFER: { label: 'Reefer', order: 99, color: '#34D399' },
  OTHER: { label: 'Other', order: 100, color: '#9CA3AF' }
};

export const NotificationType = ['INFO', 'WARNING', 'ALERT', 'PAYMENT', 'KYC', 'SYSTEM'] as const;
export type NotificationType = (typeof NotificationType)[number];
export const isNotificationType = (v: unknown): v is NotificationType => typeof v === 'string' && (NotificationType as readonly string[]).includes(v as string);
export const NotificationTypeMeta: Record<NotificationType, { label: string; order: number; color: string }> = {
  INFO: { label: 'Info', order: 999, color: '#60A5FA' },
  WARNING: { label: 'Warning', order: 998, color: '#F59E0B' },
  ALERT: { label: 'Alert', order: 997, color: '#EF4444' },
  PAYMENT: { label: 'Payment', order: 4, color: '#F59E0B' },
  KYC: { label: 'KYC', order: 5, color: '#A78BFA' },
  SYSTEM: { label: 'System', order: 996, color: '#9CA3AF' }
};

export const IssueSeverity = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;
export type IssueSeverity = (typeof IssueSeverity)[number];
export const isIssueSeverity = (v: unknown): v is IssueSeverity => typeof v === 'string' && (IssueSeverity as readonly string[]).includes(v as string);
export const IssueSeverityMeta: Record<IssueSeverity, { label: string; order: number; color: string }> = {
  LOW: { label: 'Low', order: 1, color: '#10B981' },
  MEDIUM: { label: 'Medium', order: 2, color: '#F59E0B' },
  HIGH: { label: 'High', order: 3, color: '#EF4444' },
  CRITICAL: { label: 'Critical', order: 4, color: '#7C3AED' }
};

// Helper to list choices for form selects
// Returns ordered option objects with metadata when available
export const optionList = <T extends readonly string[]>(arr: T, meta?: Record<string, { label?: string; order?: number; color?: string }>) => {
  const list = arr.map((v) => {
    const key = v as string;
    const m = meta?.[key];
    return { value: key, label: m?.label ?? key, order: m?.order ?? 9999, color: m?.color ?? '#9CA3AF' };
  });
  return list.sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));
};

export default {
  LoadStatus,
  AssetType,
  NotificationType,
  IssueSeverity,
  LoadStatusMeta,
  AssetTypeMeta,
  NotificationTypeMeta,
  IssueSeverityMeta,
  isLoadStatus,
  isAssetType,
  isNotificationType,
  isIssueSeverity,
  optionList
};
