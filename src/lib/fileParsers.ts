import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { SettlementRow, WarehouseRow, PlatformType } from '@/types/audit';

function detectPlatform(headers: string[]): PlatformType {
  const h = headers.map(s => s.toLowerCase());
  if (h.some(x => x.includes('blinkit') || x.includes('grofers') || x.includes('rcn'))) return 'Blinkit';
  if (h.some(x => x.includes('zepto') || x.includes('kirana'))) return 'Zepto';
  if (h.some(x => x.includes('swiggy') || x.includes('instamart') || x.includes('bundl'))) return 'Instamart';
  if (h.some(x => x.includes('amazon') || x.includes('fba') || x.includes('asin'))) return 'Amazon';
  return 'Auto-Detect';
}

function findCol(row: Record<string, any>, possibleKeys: string[]): string {
  const keys = Object.keys(row);
  for (const target of possibleKeys) {
    const match = keys.find(k => k.toLowerCase().replace(/[^a-z0-9]/g, '').includes(target.toLowerCase().replace(/[^a-z0-9]/g, '')));
    if (match && row[match] !== undefined && row[match] !== null) {
      return String(row[match]).trim();
    }
  }
  return '';
}

function parseNumber(val: any): number {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  const cleaned = String(val).replace(/[^0-9.-]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

export async function parseSettlementFile(file: File): Promise<{ rows: SettlementRow[]; detectedPlatform: PlatformType }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const buffer = e.target?.result;
        let jsonData: Record<string, any>[] = [];

        if (file.name.endsWith('.csv')) {
          const text = new TextDecoder('utf-8').decode(buffer as ArrayBuffer);
          const parsed = Papa.parse<Record<string, any>>(text, { header: true, skipEmptyLines: true });
          jsonData = parsed.data;
        } else {
          const workbook = XLSX.read(buffer, { type: 'array' });
          const firstSheet = workbook.SheetNames[0];
          jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(workbook.Sheets[firstSheet]);
        }

        if (jsonData.length === 0) {
          return resolve({ rows: [], detectedPlatform: 'Auto-Detect' });
        }

        const headers = Object.keys(jsonData[0] || {});
        const detectedPlatform = detectPlatform(headers);

        const rows: SettlementRow[] = jsonData.map((r, i) => {
          const debitNoteNumber = findCol(r, ['debit note', 'debitnote', 'dn number', 'dn no', 'rcn', 'claim id', 'reference no']) || `DN-UNKNOWN-${i+1}`;
          const poNumber = findCol(r, ['po number', 'ponumber', 'po no', 'order id', 'purchase order', 'invoice no']);
          const sku = findCol(r, ['sku', 'item code', 'product code', 'barcode', 'ean', 'asin', 'material']);
          const productTitle = findCol(r, ['product name', 'item description', 'description', 'title', 'sku name']) || 'Quick Commerce Item';
          const deductionType = findCol(r, ['reason', 'deduction reason', 'type', 'category', 'remark', 'claim reason']) || 'RTV Return / Damage';
          const qty = parseNumber(findCol(r, ['qty', 'quantity', 'deducted qty', 'claim qty', 'units']));
          const amount = Math.abs(parseNumber(findCol(r, ['amount', 'deducted amount', 'net amount', 'total deduction', 'value', 'claim amount'])));
          const rate = qty > 0 ? amount / qty : parseNumber(findCol(r, ['rate', 'unit price', 'cost price', 'mrp']));
          const date = findCol(r, ['date', 'txn date', 'deduction date', 'invoice date']) || new Date().toISOString().split('T')[0];
          const dcLocation = findCol(r, ['dc', 'hub', 'location', 'warehouse', 'facility', 'dark store']);

          const rowPlatformCol = findCol(r, ['platform', 'channel', 'marketplace', 'portal']);
          let rowPlatform: PlatformType = 'Blinkit';

          if (rowPlatformCol) {
            const pLower = rowPlatformCol.toLowerCase();
            if (pLower.includes('zepto')) rowPlatform = 'Zepto';
            else if (pLower.includes('swiggy') || pLower.includes('instamart')) rowPlatform = 'Instamart';
            else if (pLower.includes('blinkit') || pLower.includes('grofers')) rowPlatform = 'Blinkit';
            else if (pLower.includes('amazon')) rowPlatform = 'Amazon';
          } else {
            // Infer from Debit Note code prefix if present (e.g. DN-ZPT -> Zepto, DN-SWG -> Instamart, DN-BLK -> Blinkit)
            const dnUpper = debitNoteNumber.toUpperCase();
            if (dnUpper.includes('ZPT') || dnUpper.includes('ZEPTO')) rowPlatform = 'Zepto';
            else if (dnUpper.includes('SWG') || dnUpper.includes('INSTA') || dnUpper.includes('SWIGGY')) rowPlatform = 'Instamart';
            else if (dnUpper.includes('BLK') || dnUpper.includes('BLINKIT') || dnUpper.includes('GROF')) rowPlatform = 'Blinkit';
            else if (dnUpper.includes('AMZ') || dnUpper.includes('AMAZON')) rowPlatform = 'Amazon';
            else rowPlatform = detectedPlatform === 'Auto-Detect' ? 'Blinkit' : detectedPlatform;
          }

          return {
            id: `row-${i}`,
            platform: rowPlatform,
            debitNoteNumber,
            poNumber,
            sku,
            productTitle,
            deductionType,
            quantityDeducted: Math.max(1, qty),
            ratePerUnit: rate,
            totalDeductedAmount: amount,
            date,
            dcLocation
          };
        });

        resolve({ rows, detectedPlatform });
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}

export async function parseWarehouseFile(file: File): Promise<WarehouseRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const buffer = e.target?.result;
        let jsonData: Record<string, any>[] = [];

        if (file.name.endsWith('.csv')) {
          const text = new TextDecoder('utf-8').decode(buffer as ArrayBuffer);
          const parsed = Papa.parse<Record<string, any>>(text, { header: true, skipEmptyLines: true });
          jsonData = parsed.data;
        } else {
          const workbook = XLSX.read(buffer, { type: 'array' });
          const firstSheet = workbook.SheetNames[0];
          jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(workbook.Sheets[firstSheet]);
        }

        const rows: WarehouseRow[] = jsonData.map((r, i) => {
          const poNumber = findCol(r, ['po number', 'ponumber', 'po no', 'order id', 'reference']);
          const sku = findCol(r, ['sku', 'item code', 'product code', 'barcode', 'material']);
          const productTitle = findCol(r, ['product name', 'item description', 'title']);
          const qty = parseNumber(findCol(r, ['qty', 'quantity', 'inward qty', 'received qty', 'actual units']));
          const receivedDate = findCol(r, ['date', 'inward date', 'received date', 'entry date']) || new Date().toISOString().split('T')[0];
          const gatePassOrAwb = findCol(r, ['gate pass', 'gp no', 'awb', 'lr no', 'pod', 'challan no']);
          const condition = findCol(r, ['condition', 'status', 'remarks', 'quality']);

          return {
            id: `wh-${i}`,
            poNumber,
            sku,
            productTitle,
            quantityInwarded: qty,
            receivedDate,
            gatePassOrAwb,
            condition
          };
        });

        resolve(rows);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}
