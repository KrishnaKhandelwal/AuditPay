export type PlatformType = 'Blinkit' | 'Zepto' | 'Instamart' | 'Amazon' | 'Auto-Detect';

export type DiscrepancyType = 
  | 'GHOST_RETURN'        // Platform deducted for RTV/damage, but warehouse never received it
  | 'SHORT_RECEIPT'       // Platform claimed 100 returned, warehouse inwarded only 60
  | 'DUPLICATE_DEDUCTION' // Same debit note or PO was deducted multiple times across periods
  | 'RATE_OVERCHARGE'     // Deducted unit rate is higher than agreed transfer price / invoice rate
  | 'UNAUTHORIZED_OFFSET';// Unexpected penalties or ad spend deductions without valid campaign PO

export interface SettlementRow {
  id: string;
  platform: PlatformType;
  debitNoteNumber: string;
  poNumber: string;
  sku: string;
  productTitle: string;
  deductionType: string; // e.g. RTV, Damage, Expiry, Shortage, Ad Spend
  quantityDeducted: number;
  ratePerUnit: number;
  totalDeductedAmount: number;
  date: string;
  dcLocation?: string;
}

export interface WarehouseRow {
  id: string;
  poNumber: string;
  sku: string;
  productTitle?: string;
  quantityInwarded: number;
  receivedDate: string;
  gatePassOrAwb?: string;
  condition?: string; // Good, Scrapped, Damaged
}

export interface DiscrepancyItem {
  id: string;
  type: DiscrepancyType;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  platform: PlatformType;
  debitNoteNumber: string;
  poNumber: string;
  sku: string;
  productTitle: string;
  claimedQty: number;
  actualQty: number;
  differenceQty: number;
  disputedAmount: number;
  reason: string;
  evidence: string;
  dcLocation?: string;
  date: string;
}

export interface AuditSummary {
  totalDeductionsScanned: number;
  totalLeakageIdentified: number;
  ghostReturnsAmount: number;
  shortReceiptsAmount: number;
  duplicateDeductionsAmount: number;
  rateOverchargesAmount: number;
  discrepanciesCount: number;
  totalRowsProcessed: number;
  estimatedRecoveryPercent: number;
}
