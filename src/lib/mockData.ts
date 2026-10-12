import { SettlementRow, WarehouseRow } from '@/types/audit';

export const SAMPLE_SETTLEMENT_ROWS: SettlementRow[] = [
  {
    id: 's-1',
    platform: 'Blinkit',
    debitNoteNumber: 'DN-BLK-98210',
    poNumber: 'PO-2024-8812',
    sku: 'SNK-CHIPS-100G',
    productTitle: 'Artisan Kettle Sea Salt Chips 100g',
    deductionType: 'RTV - Dark Store Return',
    quantityDeducted: 120,
    ratePerUnit: 65,
    totalDeductedAmount: 7800,
    date: '2026-10-02',
    dcLocation: 'Gurugram DC-04'
  },
  {
    id: 's-2',
    platform: 'Blinkit',
    debitNoteNumber: 'DN-BLK-98211',
    poNumber: 'PO-2024-8815',
    sku: 'BVG-COLDBREW-200ML',
    productTitle: 'Cold Brew Vanilla 200ml Glass Bottle',
    deductionType: 'Damage & Leakage Claim',
    quantityDeducted: 85,
    ratePerUnit: 110,
    totalDeductedAmount: 9350,
    date: '2026-10-03',
    dcLocation: 'South Delhi Hub'
  },
  {
    id: 's-3',
    platform: 'Zepto',
    debitNoteNumber: 'DN-ZPT-44019',
    poNumber: 'PO-2024-8820',
    sku: 'NUT-ALMOND-250G',
    productTitle: 'California Roasted Almonds 250g',
    deductionType: 'RTV - Customer Cancellation Return',
    quantityDeducted: 50,
    ratePerUnit: 240,
    totalDeductedAmount: 12000,
    date: '2026-10-04',
    dcLocation: 'Mumbai Central Hub'
  },
  {
    id: 's-4',
    platform: 'Zepto',
    debitNoteNumber: 'DN-ZPT-44019', // Intentionally duplicated debit note
    poNumber: 'PO-2024-8820',
    sku: 'NUT-ALMOND-250G',
    productTitle: 'California Roasted Almonds 250g',
    deductionType: 'RTV - Customer Cancellation Return',
    quantityDeducted: 50,
    ratePerUnit: 240,
    totalDeductedAmount: 12000,
    date: '2026-10-07',
    dcLocation: 'Mumbai Central Hub'
  },
  {
    id: 's-5',
    platform: 'Instamart',
    debitNoteNumber: 'DN-SWG-33012',
    poNumber: 'PO-2024-8833',
    sku: 'PROT-BAR-BERRY-60G',
    productTitle: 'Superberry 20g Whey Protein Bar',
    deductionType: 'Expiry Shelf-Life Breach',
    quantityDeducted: 150,
    ratePerUnit: 90,
    totalDeductedAmount: 13500,
    date: '2026-10-05',
    dcLocation: 'Bengaluru Bellandur DC'
  },
  {
    id: 's-6',
    platform: 'Blinkit',
    debitNoteNumber: 'DN-BLK-98240',
    poNumber: 'PO-2024-8840',
    sku: 'SNK-MAKHANA-70G',
    productTitle: 'Roasted Peri Peri Makhana 70g',
    deductionType: 'Shortage Inward Adjustment',
    quantityDeducted: 40,
    ratePerUnit: 85,
    totalDeductedAmount: 3400,
    date: '2026-10-06',
    dcLocation: 'Noida Sector 62'
  },
  {
    id: 's-7',
    platform: 'Zepto',
    debitNoteNumber: 'DN-ZPT-99120',
    poNumber: '',
    sku: '',
    productTitle: 'Unspecified Marketing Deduction',
    deductionType: 'Ad Spend Co-Op Marketing Fee',
    quantityDeducted: 1,
    ratePerUnit: 8500,
    totalDeductedAmount: 8500,
    date: '2026-10-06',
    dcLocation: 'Corporate HQ Offset'
  },
  {
    id: 's-8',
    platform: 'Instamart',
    debitNoteNumber: 'DN-SWG-33045',
    poNumber: 'PO-2024-8850',
    sku: 'SNK-CHIPS-100G',
    productTitle: 'Artisan Kettle Sea Salt Chips 100g',
    deductionType: 'RTV - Packaging Blemish',
    quantityDeducted: 60,
    ratePerUnit: 65,
    totalDeductedAmount: 3900,
    date: '2026-10-08',
    dcLocation: 'Hyderabad Hitec City'
  }
];

export const SAMPLE_WAREHOUSE_ROWS: WarehouseRow[] = [
  {
    id: 'w-1',
    poNumber: 'PO-2024-8815',
    sku: 'BVG-COLDBREW-200ML',
    productTitle: 'Cold Brew Vanilla 200ml Glass Bottle',
    quantityInwarded: 35, // Blinkit deducted 85, but only 35 received! Short by 50 units
    receivedDate: '2026-10-05',
    gatePassOrAwb: 'GP-DEL-88219',
    condition: 'Received partially broken'
  },
  {
    id: 'w-2',
    poNumber: 'PO-2024-8850',
    sku: 'SNK-CHIPS-100G',
    productTitle: 'Artisan Kettle Sea Salt Chips 100g',
    quantityInwarded: 60, // Exactly matched with Instamart (Valid, not disputed)
    receivedDate: '2026-10-09',
    gatePassOrAwb: 'GP-HYD-44101',
    condition: 'Cartons intact'
  }
  // Notice PO-2024-8812 (Blinkit 120 chips) is completely missing! (Ghost Return)
  // Notice PO-2024-8820 (Zepto 50 almonds) is completely missing! (Ghost Return + Duplicate)
  // Notice PO-2024-8833 (Instamart 150 protein bars) is completely missing! (Ghost Return)
  // Notice PO-2024-8840 (Blinkit 40 makhana) is completely missing! (Ghost Return)
];
