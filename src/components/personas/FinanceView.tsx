'use client';

import React from 'react';
import { FileSpreadsheet, AlertTriangle, Layers, Download } from 'lucide-react';
import { SettlementRow, DiscrepancyItem } from '@/types/audit';

interface FinanceViewProps {
  settlementRows: SettlementRow[];
  discrepancies: DiscrepancyItem[];
}

export const FinanceView: React.FC<FinanceViewProps> = ({ settlementRows, discrepancies }) => {
  const duplicateDeductions = discrepancies.filter(d => d.type === 'DUPLICATE_DEDUCTION');
  const unauthorizedOffsets = discrepancies.filter(d => d.type === 'UNAUTHORIZED_OFFSET');

  return (
    <div className="space-y-6">
      
      {/* Finance Role Intro */}
      <div className="p-6 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Accounting Ledger & Settlement Reconciliation
          </span>
          <h2 className="text-xl font-bold text-white mt-1">
            Settlement Audit & Debit Note Integrity
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Audit your debit note journals, prevent duplicate deductions in Tally/ERP, and flag unapproved ad-spend offsets.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-right">
            <div className="text-xs text-gray-400">Total Scanned Invoices</div>
            <div className="text-lg font-bold text-white">{settlementRows.length} Debit Notes</div>
          </div>
        </div>
      </div>

      {/* Duplicate Debit Notes Warning Panel */}
      <div className="p-5 rounded-2xl bg-gray-900/60 border border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>Duplicate Debit Notes Found ({duplicateDeductions.length})</span>
          </h3>
          <span className="text-xs text-rose-400 font-semibold bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
            Critical Accounting Error
          </span>
        </div>

        {duplicateDeductions.length === 0 ? (
          <p className="text-xs text-gray-500">Zero duplicate debit notes identified across settlement cycles.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="text-[11px] uppercase text-gray-500 border-b border-gray-800">
                <tr>
                  <th className="py-2.5 px-3">Debit Note #</th>
                  <th className="py-2.5 px-3">Platform</th>
                  <th className="py-2.5 px-3">Linked PO</th>
                  <th className="py-2.5 px-3 text-right">Duplicate Amount</th>
                  <th className="py-2.5 px-3">Accounting Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/40">
                {duplicateDeductions.map((d, i) => (
                  <tr key={i} className="hover:bg-gray-800/20">
                    <td className="py-2.5 px-3 font-mono font-semibold text-white">{d.debitNoteNumber}</td>
                    <td className="py-2.5 px-3 text-emerald-400">{d.platform}</td>
                    <td className="py-2.5 px-3 font-mono text-gray-400">{d.poNumber}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-rose-400">₹{d.disputedAmount.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-3 text-gray-400">Deducted twice in same billing period. Void second entry in Tally.</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Unapproved Ad Spends & Offsets */}
      <div className="p-5 rounded-2xl bg-gray-900/60 border border-gray-800">
        <h3 className="text-sm font-bold text-white flex items-center space-x-2 mb-3">
          <Layers className="w-4 h-4 text-purple-400" />
          <span>Unapproved Co-Op Marketing / Ad Spend Offsets ({unauthorizedOffsets.length})</span>
        </h3>
        
        {unauthorizedOffsets.length === 0 ? (
          <p className="text-xs text-gray-500">All marketing adjustments have valid PO references.</p>
        ) : (
          <div className="space-y-2">
            {unauthorizedOffsets.map((off, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-gray-950/60 border border-gray-800 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-white">{off.productTitle} ({off.debitNoteNumber})</div>
                  <div className="text-gray-400">{off.reason}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-purple-400 text-sm">₹{off.disputedAmount.toLocaleString('en-IN')}</div>
                  <span className="text-[10px] text-gray-500">Lacks Insertion Order</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
