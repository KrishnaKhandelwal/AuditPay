'use client';

import React from 'react';
import { Warehouse, CheckCircle2, AlertCircle, PackageX, Truck } from 'lucide-react';
import { WarehouseRow, DiscrepancyItem } from '@/types/audit';

interface WarehouseViewProps {
  warehouseRows: WarehouseRow[];
  discrepancies: DiscrepancyItem[];
}

export const WarehouseView: React.FC<WarehouseViewProps> = ({ warehouseRows, discrepancies }) => {
  const ghostReturns = discrepancies.filter(d => d.type === 'GHOST_RETURN');
  const shortReceipts = discrepancies.filter(d => d.type === 'SHORT_RECEIPT');

  return (
    <div className="space-y-6">
      
      {/* Warehouse Role Intro */}
      <div className="p-6 rounded-2xl bg-blue-950/20 border border-blue-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
            3PL & Gate Operations Audit
          </span>
          <h2 className="text-xl font-bold text-white mt-1">
            Physical Inventory Verification & Shortage Ledger
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Reconcile physical cartons received at warehouse gate against claims made by quick-commerce dark stores.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-right">
            <div className="text-xs text-gray-400">Logged Gate Inward Passes</div>
            <div className="text-lg font-bold text-white">{warehouseRows.length} Gate Entries</div>
          </div>
        </div>
      </div>

      {/* Discrepancy comparison cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Phantom / Ghost RTVs */}
        <div className="p-5 rounded-2xl bg-gray-900/60 border border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <PackageX className="w-4 h-4 text-amber-400" />
              <span>Ghost RTVs — Zero Delivery Received ({ghostReturns.length})</span>
            </h3>
            <span className="text-[11px] text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-full">
              Missing Physical Stock
            </span>
          </div>

          <div className="space-y-2">
            {ghostReturns.map((item, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-gray-950/60 border border-gray-800 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-white">{item.productTitle}</div>
                  <div className="text-gray-400 font-mono text-[11px]">PO: {item.poNumber} • SKU: {item.sku}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-rose-400">{item.claimedQty} units claimed</div>
                  <div className="text-[10px] text-gray-500">0 units logged at gate</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Short Receipts */}
        <div className="p-5 rounded-2xl bg-gray-900/60 border border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Truck className="w-4 h-4 text-blue-400" />
              <span>Short Inwards — Partial Quantities ({shortReceipts.length})</span>
            </h3>
            <span className="text-[11px] text-blue-400 font-semibold bg-blue-500/10 px-2 py-0.5 rounded-full">
              Quantity Mismatch
            </span>
          </div>

          <div className="space-y-2">
            {shortReceipts.map((item, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-gray-950/60 border border-gray-800 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-white">{item.productTitle}</div>
                  <div className="text-gray-400 font-mono text-[11px]">PO: {item.poNumber}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-white">
                    <span className="text-rose-400">{item.claimedQty}</span> claimed vs <span className="text-emerald-400">{item.actualQty}</span> received
                  </div>
                  <div className="text-[10px] text-rose-300">Short by {item.differenceQty} units</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
