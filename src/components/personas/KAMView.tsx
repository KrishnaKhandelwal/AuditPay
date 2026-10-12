'use client';

import React, { useState } from 'react';
import { Send, FileText, Download, Check, Copy, ExternalLink, ShieldCheck, Clock } from 'lucide-react';
import { DiscrepancyItem, PlatformType } from '@/types/audit';
import { generateDisputeClaimLetter } from '@/lib/reconciliationEngine';
import * as XLSX from 'xlsx';

interface KAMViewProps {
  discrepancies: DiscrepancyItem[];
  detectedPlatform: PlatformType;
}

export const KAMView: React.FC<KAMViewProps> = ({ discrepancies, detectedPlatform }) => {
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType>(detectedPlatform || 'Blinkit');
  const [brandName, setBrandName] = useState('My D2C Brand');
  const [copied, setCopied] = useState(false);

  const filteredDiscrepancies = selectedPlatform === 'Auto-Detect' 
    ? discrepancies 
    : discrepancies.filter(d => d.platform === selectedPlatform);

  const totalDisputeAmount = filteredDiscrepancies.reduce((acc, curr) => acc + curr.disputedAmount, 0);

  const handleCopyLetter = () => {
    const text = generateDisputeClaimLetter(selectedPlatform, filteredDiscrepancies, brandName);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportExcel = () => {
    const exportData = filteredDiscrepancies.map(d => ({
      'Platform': d.platform,
      'Debit Note Number': d.debitNoteNumber,
      'PO Number': d.poNumber,
      'SKU': d.sku,
      'Product Name': d.productTitle,
      'Deduction Category': d.type,
      'Platform Claimed Qty': d.claimedQty,
      'Warehouse Received Qty': d.actualQty,
      'Shortage Qty': d.differenceQty,
      'Disputed Reversal Amount (INR)': d.disputedAmount,
      'Grounds for Dispute': d.reason,
      'Evidence / POD Status': d.evidence,
      'DC Location': d.dcLocation || '',
      'Date': d.date
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Dispute_Claim_Data');
    XLSX.writeFile(wb, `${selectedPlatform}_Dispute_Claim_Package.xlsx`);
  };

  return (
    <div className="space-y-6">
      
      {/* KAM Intro Header */}
      <div className="p-6 rounded-2xl bg-purple-950/20 border border-purple-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
            Key Account Manager (KAM) Action Center
          </span>
          <h2 className="text-xl font-bold text-white mt-1">
            Vendor Support Dispute & Ticket Submission Desk
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Auto-generate claim emails, copy dispute text, and export vendor-compliant evidence within the platform 14-day SLA window.
          </p>
        </div>

        {/* Platform Selector */}
        <div className="flex items-center space-x-2 bg-gray-900 p-1.5 rounded-xl border border-gray-800">
          {(['Blinkit', 'Zepto', 'Instamart'] as PlatformType[]).map(plat => (
            <button
              key={plat}
              onClick={() => setSelectedPlatform(plat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedPlatform === plat 
                  ? 'bg-purple-500 text-white shadow' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {plat}
            </button>
          ))}
        </div>
      </div>

      {/* SLA Alert Card */}
      <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-3">
          <Clock className="w-4 h-4 text-amber-400" />
          <span className="text-gray-300">
            <strong>{selectedPlatform} Dispute Policy:</strong> Reversal claims must be submitted within <strong>14 days</strong> of Debit Note receipt with attached proof.
          </span>
        </div>
        <div className="font-bold text-purple-400 text-sm">
          Claim Value: ₹{totalDisputeAmount.toLocaleString('en-IN')}
        </div>
      </div>

      {/* Dual Column: Live Preview & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Controls Column */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-gray-900/60 border border-gray-800 space-y-4">
            <h3 className="text-sm font-bold text-white">Dispute Parameters</h3>
            
            <div>
              <label className="text-xs text-gray-400 block mb-1">Company / Brand Name</label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="pt-2 border-t border-gray-800 space-y-2">
              <button
                onClick={handleCopyLetter}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-purple-500 hover:bg-purple-400 text-white flex items-center justify-center space-x-2 transition-all shadow-lg shadow-purple-500/20"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Support Claim Draft'}</span>
              </button>

              <button
                onClick={exportExcel}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 flex items-center justify-center space-x-2 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Export Dispute Excel Package</span>
              </button>
            </div>
          </div>

          {/* Quick links to Vendor Portals */}
          <div className="p-4 rounded-xl bg-gray-900/40 border border-gray-800 text-xs space-y-2">
            <span className="text-gray-400 font-semibold block">Quick-Commerce Partner Portals:</span>
            <div className="space-y-1 text-gray-300">
              <div className="flex items-center justify-between">
                <span>Blinkit Partner Hub</span>
                <span className="text-[10px] text-gray-500">Tickets & Claims</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Zepto Partner Portal</span>
                <span className="text-[10px] text-gray-500">Finance & RTV</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Swiggy Partner Desk</span>
                <span className="text-[10px] text-gray-500">Instamart Reversals</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Draft Preview */}
        <div className="lg:col-span-2">
          <div className="p-5 rounded-2xl bg-gray-900/60 border border-gray-800 flex flex-col h-full">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <FileText className="w-4 h-4 text-purple-400" />
                <span>Live Vendor Support Email Draft</span>
              </h3>
              <span className="text-[11px] text-gray-500 font-mono">
                {filteredDiscrepancies.length} Line items enclosed
              </span>
            </div>

            <div className="flex-1 bg-gray-950 p-4 rounded-xl border border-gray-800/80 font-mono text-xs text-gray-300 whitespace-pre-wrap overflow-y-auto max-h-[460px]">
              {generateDisputeClaimLetter(selectedPlatform, filteredDiscrepancies, brandName)}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
