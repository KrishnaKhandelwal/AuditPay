import { SettlementRow, WarehouseRow, DiscrepancyItem, AuditSummary, PlatformType } from '@/types/audit';

export function runReconciliationAudit(
  settlementRows: SettlementRow[],
  warehouseRows: WarehouseRow[]
): { discrepancies: DiscrepancyItem[]; summary: AuditSummary } {
  const discrepancies: DiscrepancyItem[] = [];

  // Group warehouse inwards by SKU + PO and by SKU alone
  const warehouseMap = new Map<string, number>();
  warehouseRows.forEach(w => {
    const key = `${w.sku.trim().toUpperCase()}__${w.poNumber.trim().toUpperCase()}`;
    const current = warehouseMap.get(key) || 0;
    warehouseMap.set(key, current + w.quantityInwarded);
  });

  // Track debit note IDs to flag duplicate deductions
  const debitNoteCount = new Map<string, number>();
  settlementRows.forEach(s => {
    const key = `${s.platform}__${s.debitNoteNumber.trim()}`;
    debitNoteCount.set(key, (debitNoteCount.get(key) || 0) + 1);
  });

  let totalDeductionsScanned = 0;
  let ghostReturnsAmount = 0;
  let shortReceiptsAmount = 0;
  let duplicateDeductionsAmount = 0;
  let rateOverchargesAmount = 0;

  const processedDebitNotes = new Set<string>();

  settlementRows.forEach((s, idx) => {
    totalDeductionsScanned += s.totalDeductedAmount;
    const dedupeKey = `${s.platform}__${s.debitNoteNumber.trim()}`;

    // 1. Check for Duplicate Deductions
    if ((debitNoteCount.get(dedupeKey) || 0) > 1 && processedDebitNotes.has(dedupeKey)) {
      const disputed = s.totalDeductedAmount;
      duplicateDeductionsAmount += disputed;
      discrepancies.push({
        id: `disc-dup-${idx}`,
        type: 'DUPLICATE_DEDUCTION',
        severity: 'HIGH',
        platform: s.platform,
        debitNoteNumber: s.debitNoteNumber,
        poNumber: s.poNumber,
        sku: s.sku,
        productTitle: s.productTitle,
        claimedQty: s.quantityDeducted,
        actualQty: 0,
        differenceQty: s.quantityDeducted,
        disputedAmount: disputed,
        reason: `Debit Note #${s.debitNoteNumber} deducted multiple times across settlement cycles.`,
        evidence: `Duplicate entry flagged for PO #${s.poNumber} in current period.`,
        dcLocation: s.dcLocation,
        date: s.date
      });
      return;
    }
    processedDebitNotes.add(dedupeKey);

    // Only audit physical returns / damage / shortage / RTV deductions against warehouse inwards
    const isPhysicalReturn = /rtv|return|damage|leakage|expiry|shortage/i.test(s.deductionType);

    if (isPhysicalReturn) {
      const key = `${s.sku.trim().toUpperCase()}__${s.poNumber.trim().toUpperCase()}`;
      const inwardQty = warehouseMap.get(key);

      if (inwardQty === undefined || inwardQty === 0) {
        // GHOST RETURN: Platform deducted money for returning goods, but warehouse has 0 record
        const disputed = s.totalDeductedAmount;
        ghostReturnsAmount += disputed;
        discrepancies.push({
          id: `disc-ghost-${idx}`,
          type: 'GHOST_RETURN',
          severity: 'HIGH',
          platform: s.platform,
          debitNoteNumber: s.debitNoteNumber,
          poNumber: s.poNumber,
          sku: s.sku,
          productTitle: s.productTitle,
          claimedQty: s.quantityDeducted,
          actualQty: 0,
          differenceQty: s.quantityDeducted,
          disputedAmount: disputed,
          reason: `Zero physical inward registered at warehouse for ${s.quantityDeducted} units.`,
          evidence: `No matching Gate Entry / POD found for PO #${s.poNumber}.`,
          dcLocation: s.dcLocation,
          date: s.date
        });
      } else if (inwardQty < s.quantityDeducted) {
        // SHORT RECEIPT: Platform claimed they returned 100 units, but only 60 arrived
        const shortQty = s.quantityDeducted - inwardQty;
        const unitRate = s.quantityDeducted > 0 ? s.totalDeductedAmount / s.quantityDeducted : s.ratePerUnit;
        const disputed = Math.round(shortQty * unitRate);
        shortReceiptsAmount += disputed;
        discrepancies.push({
          id: `disc-short-${idx}`,
          type: 'SHORT_RECEIPT',
          severity: 'HIGH',
          platform: s.platform,
          debitNoteNumber: s.debitNoteNumber,
          poNumber: s.poNumber,
          sku: s.sku,
          productTitle: s.productTitle,
          claimedQty: s.quantityDeducted,
          actualQty: inwardQty,
          differenceQty: shortQty,
          disputedAmount: disputed,
          reason: `Platform deducted for ${s.quantityDeducted} units, but warehouse physically received only ${inwardQty} units.`,
          evidence: `Short receipt of ${shortQty} units verified on Gate Entry register.`,
          dcLocation: s.dcLocation,
          date: s.date
        });
      }
    }

    // 2. Check for suspicious Ad spend offset without campaign reference
    if (/ad\s*spend|marketing|promotion|penalty/i.test(s.deductionType) && (!s.poNumber || s.poNumber === 'NA' || s.poNumber === '-')) {
      const disputed = s.totalDeductedAmount;
      rateOverchargesAmount += disputed;
      discrepancies.push({
        id: `disc-offset-${idx}`,
        type: 'UNAUTHORIZED_OFFSET',
        severity: 'MEDIUM',
        platform: s.platform,
        debitNoteNumber: s.debitNoteNumber,
        poNumber: s.poNumber || 'UNLINKED',
        sku: s.sku || 'N/A',
        productTitle: s.productTitle || 'Marketing Offset',
        claimedQty: 1,
        actualQty: 0,
        differenceQty: 1,
        disputedAmount: disputed,
        reason: `Deduction marked as "${s.deductionType}" without valid linked Campaign PO or signed approval.`,
        evidence: `Debit Note lacks valid insertion order (IO) mapping.`,
        dcLocation: s.dcLocation,
        date: s.date
      });
    }
  });

  const totalLeakageIdentified = ghostReturnsAmount + shortReceiptsAmount + duplicateDeductionsAmount + rateOverchargesAmount;
  const estimatedRecoveryPercent = totalDeductionsScanned > 0 
    ? Math.min(100, Math.round((totalLeakageIdentified / totalDeductionsScanned) * 100)) 
    : 0;

  const summary: AuditSummary = {
    totalDeductionsScanned,
    totalLeakageIdentified,
    ghostReturnsAmount,
    shortReceiptsAmount,
    duplicateDeductionsAmount,
    rateOverchargesAmount,
    discrepanciesCount: discrepancies.length,
    totalRowsProcessed: settlementRows.length,
    estimatedRecoveryPercent
  };

  return { discrepancies, summary };
}

// Generate platform dispute ticket text
export function generateDisputeClaimLetter(
  platform: PlatformType,
  discrepancies: DiscrepancyItem[],
  brandName: string = 'Our Brand'
): string {
  const platformName = platform === 'Auto-Detect' ? 'Quick Commerce Partner Support' : `${platform} Partner Support`;
  const totalAmount = discrepancies.reduce((acc, curr) => acc + curr.disputedAmount, 0);

  const lines = [
    `To: ${platformName}`,
    `Subject: URGENT: Formal Dispute & Reversal Claim for Unauthorized Settlement Deductions (Total: ₹${totalAmount.toLocaleString('en-IN')})`,
    ``,
    `Dear ${platform} Vendor Reconciliation & Finance Team,`,
    ``,
    `We have conducted our internal warehouse inward audit against the recent settlement payout debit notes issued to ${brandName}.`,
    `We have identified ₹${totalAmount.toLocaleString('en-IN')} in erroneous/unverified deductions across ${discrepancies.length} line items that require immediate credit note reversal.`,
    ``,
    `SUMMARY OF DISPUTED AMOUNTS:`,
    `- Total Claims Count: ${discrepancies.length} items`,
    `- Total Reversal Amount Demanded: ₹${totalAmount.toLocaleString('en-IN')}`,
    ``,
    `LINE-ITEM BREAKDOWN WITH PHYSICAL AUDIT EVIDENCE:`,
    `-----------------------------------------------------------------------------------------------------------------`,
    `DN Number        | PO Number       | SKU Code        | Claimed Qty | Warehouse Recv | Disputed Qty | Claim Amount (₹)`,
    `-----------------------------------------------------------------------------------------------------------------`
  ];

  discrepancies.slice(0, 25).forEach(d => {
    lines.push(
      `${d.debitNoteNumber.padEnd(16)} | ${d.poNumber.padEnd(15)} | ${d.sku.padEnd(15)} | ${String(d.claimedQty).padEnd(11)} | ${String(d.actualQty).padEnd(14)} | ${String(d.differenceQty).padEnd(12)} | ₹${d.disputedAmount.toLocaleString('en-IN')}`
    );
  });

  if (discrepancies.length > 25) {
    lines.push(`... and ${discrepancies.length - 25} additional line items detailed in the attached audit ledger.`);
  }

  lines.push(
    `-----------------------------------------------------------------------------------------------------------------`,
    ``,
    `GROUNDS FOR DISPUTE:`,
    `1. Non-Receipt of Stock (Ghost RTV): The physical inventory corresponding to these debit notes was never delivered to our designated warehouse/3PL gate entry.`,
    `2. Short Inward: In cases of partial return, our gate entry passes acknowledge receipt of fewer units than what was deducted on the debit note.`,
    `3. Absence of POD (Proof of Delivery): Under our vendor agreement, deductions without counter-signed PODs or valid GRN receipts are void.`,
    ``,
    `Please acknowledge receipt of this dispute dossier within 48 hours and initiate the credit note adjustment in the upcoming billing cycle.`,
    ``,
    `Regards,`,
    `Finance & Operations Team`,
    `${brandName}`
  );

  return lines.join('\n');
}
