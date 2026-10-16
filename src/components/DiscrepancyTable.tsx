'use client';

import React, { useMemo, useState } from 'react';
import { 
  Download, 
  Copy, 
  Check, 
  Filter, 
  Search, 
  FileText, 
  Send,
  ChevronLeft,
  ChevronRight,
  Lock,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import * as XLSX from 'xlsx';
import confetti from 'canvas-confetti';
import { DiscrepancyItem, PlatformType } from '@/types/audit';
import { generateDisputeClaimLetter } from '@/lib/reconciliationEngine';
import { useAuth } from '@/context/AuthContext';

interface DiscrepancyTableProps {
  discrepancies: DiscrepancyItem[];
  detectedPlatform: PlatformType;
}

// Helper to extract clean city name from DC location strings (e.g. "Gurugram DC-01" -> "Gurugram")
function extractCity(dcLocation?: string): string {
  if (!dcLocation) return '';
  const loc = dcLocation.trim();
  const lower = loc.toLowerCase();

  if (lower.includes('gurugram') || lower.includes('gurgaon')) return 'Gurugram';
  if (lower.includes('delhi')) return 'Delhi';
  if (lower.includes('noida')) return 'Noida';
  if (lower.includes('mumbai') || lower.includes('thane') || lower.includes('bandra') || lower.includes('andheri')) return 'Mumbai';
  if (lower.includes('bengaluru') || lower.includes('bangalore') || lower.includes('bellandur') || lower.includes('indiranagar') || lower.includes('koramangala') || lower.includes('whitefield')) return 'Bengaluru';
  if (lower.includes('hyderabad') || lower.includes('hitec') || lower.includes('gachibowli')) return 'Hyderabad';
  if (lower.includes('pune') || lower.includes('viman nagar') || lower.includes('koregaon')) return 'Pune';
  if (lower.includes('chennai') || lower.includes('omr') || lower.includes('anna nagar')) return 'Chennai';
  if (lower.includes('kolkata') || lower.includes('salt lake')) return 'Kolkata';

  // Fallback: take the first word
  const firstWord = loc.split(/[\s\-_/]/)[0];
  return firstWord || loc;
}

export const DiscrepancyTable: React.FC<DiscrepancyTableProps> = ({ 
  discrepancies, 
  detectedPlatform 
}) => {
  const { 
    canExportDisputePackage, 
    canGenerateDisputeEmail, 
    canViewAllDiscrepancies, 
    openPaywallModal,
    isAuthenticated,
    user 
  } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedCity, setSelectedCity] = useState<string>('ALL');
  const [brandName, setBrandName] = useState(user?.brandName || 'Our D2C Brand');
  const [copiedLetter, setCopiedLetter] = useState(false);
  const [showLetterModal, setShowLetterModal] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Extract unique cities present in the dataset
  const uniqueCities = useMemo(() => {
    const citySet = new Set<string>();
    discrepancies.forEach(d => {
      const city = extractCity(d.dcLocation);
      if (city && city.toLowerCase() !== 'corporate' && city.toLowerCase() !== 'na') {
        citySet.add(city);
      }
    });
    return Array.from(citySet).sort();
  }, [discrepancies]);

  // Only show the city filter if there is a mix of cities (more than 1 distinct city)
  const hasMultipleCities = uniqueCities.length > 1;

  // Filter items based on search, Category AND City
  const filtered = discrepancies.filter(d => {
    const matchesSearch = 
      d.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.debitNoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.productTitle.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = selectedType === 'ALL' || d.type === selectedType;

    const itemCity = extractCity(d.dcLocation);
    const matchesCity = selectedCity === 'ALL' || itemCity.toLowerCase() === selectedCity.toLowerCase();

    return matchesSearch && matchesType && matchesCity;
  });

  const isFreePlan = !canViewAllDiscrepancies();
  const freePreviewLimit = 3;
  const lockedCount = isFreePlan ? Math.max(0, filtered.length - freePreviewLimit) : 0;
  const lockedAmount = isFreePlan 
    ? filtered.slice(freePreviewLimit).reduce((acc, curr) => acc + curr.disputedAmount, 0)
    : 0;

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filtered.length);

  // If on free plan, only display the top 3 items
  const paginatedItems = isFreePlan 
    ? filtered.slice(0, freePreviewLimit) 
    : filtered.slice(startIndex, endIndex);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleExportClick = () => {
    if (!canExportDisputePackage()) {
      openPaywallModal('Excel Dispute Claim Package');
      return;
    }

    confetti({ particleCount: 70, spread: 50, origin: { y: 0.8 } });

    const exportData = filtered.map(d => ({
      'Platform': d.platform,
      'Debit Note Number': d.debitNoteNumber,
      'PO Number': d.poNumber,
      'SKU / Item Code': d.sku,
      'Product Title': d.productTitle,
      'Dispute Category': d.type,
      'Claimed Deducted Qty': d.claimedQty,
      'Actual Warehouse Inward Qty': d.actualQty,
      'Disputed Unit Shortage': d.differenceQty,
      'Claim Amount (INR)': d.disputedAmount,
      'Audit Reason': d.reason,
      'Evidence / Proof': d.evidence,
      'DC Location': d.dcLocation || '',
      'Date': d.date
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Dispute_Ledger');
    XLSX.writeFile(wb, `Dispute_Claim_Package_${detectedPlatform}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleGenerateEmailClick = () => {
    if (!canGenerateDisputeEmail()) {
      openPaywallModal('Official Vendor SLA Dispute Email');
      return;
    }
    setShowLetterModal(true);
  };

  const handleCopyLetter = () => {
    const letter = generateDisputeClaimLetter(detectedPlatform, filtered, brandName);
    navigator.clipboard.writeText(letter);
    setCopiedLetter(true);
    setTimeout(() => setCopiedLetter(false), 2500);
  };

  // Pastel Pill Badges with dark mode support
  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'GHOST_RETURN':
        return 'bg-[#FEF9C3] dark:bg-amber-950/40 text-[#854D0E] dark:text-amber-300 border-[#FEF08A] dark:border-amber-800/60';
      case 'SHORT_RECEIPT':
        return 'bg-[#E0F2FE] dark:bg-sky-950/40 text-[#0369A1] dark:text-sky-300 border-[#BAE6FD] dark:border-sky-800/60';
      case 'DUPLICATE_DEDUCTION':
        return 'bg-[#FFE4E6] dark:bg-rose-950/40 text-[#9F1239] dark:text-rose-300 border-[#FECDD3] dark:border-rose-800/60';
      case 'UNAUTHORIZED_OFFSET':
        return 'bg-[#F3E8FF] dark:bg-purple-950/40 text-[#6B21A8] dark:text-purple-300 border-[#E9D5FF] dark:border-purple-800/60';
      default:
        return 'bg-[#F1F5F9] dark:bg-slate-800 text-[#475569] dark:text-slate-300 border-[#E2E8F0] dark:border-slate-700';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden transition-colors duration-200">
      
      {/* Table Header Bar */}
      <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center space-x-2">
              <span>Deduction Leakage Breakdown</span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#ECFDF5] dark:bg-emerald-950/50 text-[#065F46] dark:text-emerald-300 border border-[#A7F3D0] dark:border-emerald-800/60">
                {filtered.length > 0 ? `${filtered.length} Disputed Items` : 'No data'}
              </span>
            </h2>
            {isFreePlan && filtered.length > 0 && (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800/60">
                Free Preview (Top 3)
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-400 mt-0.5">
            Verified discrepancies ready for immediate dispute submission.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleGenerateEmailClick}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer relative"
          >
            {isFreePlan && <Lock className="w-3 h-3 text-amber-500" />}
            <FileText className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Generate Dispute Email</span>
          </button>

          <button
            onClick={handleExportClick}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#059669] hover:bg-[#047857] text-white transition-all shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:scale-[1.01] cursor-pointer relative"
          >
            {isFreePlan && <Lock className="w-3 h-3 text-amber-200" />}
            <Download className="w-3.5 h-3.5" />
            <span>Download Dispute Package (Excel)</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="px-5 sm:px-6 py-3 bg-[#F8FAFC] dark:bg-slate-950/60 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search SKU, PO, or Debit Note..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 shadow-2xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          {/* Categories Dropdown */}
          <div className="flex items-center space-x-1.5">
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:border-emerald-500 shadow-2xs font-medium cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              <option value="GHOST_RETURN">Phantom / Ghost RTV</option>
              <option value="SHORT_RECEIPT">Short Receipts</option>
              <option value="DUPLICATE_DEDUCTION">Duplicate Deductions</option>
              <option value="UNAUTHORIZED_OFFSET">Unauthorized Offsets</option>
            </select>
          </div>

          {/* Filter by City */}
          {hasMultipleCities && (
            <div className="flex items-center space-x-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 shadow-2xs">
              <Filter className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-slate-500 dark:text-slate-400 font-medium">City:</span>
              <select
                value={selectedCity}
                onChange={(e) => {
                  setSelectedCity(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent border-0 text-slate-700 dark:text-slate-200 text-xs focus:outline-hidden font-medium cursor-pointer pr-1"
              >
                <option value="ALL">All Cities ({uniqueCities.length})</option>
                {uniqueCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Table Data */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
          <thead className="bg-[#F8FAFC] dark:bg-slate-950/60 text-slate-400 dark:text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-100 dark:border-slate-800">
            <tr>
              <th className="py-3 px-5">Platform & DN</th>
              <th className="py-3 px-5">PO & SKU Code</th>
              <th className="py-3 px-5">Category</th>
              <th className="py-3 px-5 text-center">Claimed / Actual</th>
              <th className="py-3 px-5 text-right">Disputed Amount</th>
              <th className="py-3 px-5">Audit Grounds / Evidence</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {paginatedItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400 dark:text-slate-500">
                  <div className="flex flex-col items-center justify-center space-y-1">
                    <span className="font-bold text-sm text-slate-700 dark:text-slate-300">No data available</span>
                    <span className="text-xs text-slate-400 max-w-sm">
                      {!isAuthenticated 
                        ? 'Sign in to your merchant account to upload settlement statements and view audited discrepancy records.' 
                        : 'Upload a settlement statement to run deduction reconciliation.'}
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedItems.map((item) => (
                <tr key={item.id} className="hover:bg-[#F8FAFC]/80 dark:hover:bg-slate-800/40 transition-colors">
                  
                  {/* Platform & DN */}
                  <td className="py-3 px-5 whitespace-nowrap">
                    <div className="font-semibold text-slate-800 dark:text-slate-100">{item.debitNoteNumber}</div>
                    <div className="text-[11px] text-emerald-700 dark:text-emerald-400">{item.platform} • {item.date}</div>
                    {item.dcLocation && (
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[120px]">{item.dcLocation}</div>
                    )}
                  </td>

                  {/* PO & SKU */}
                  <td className="py-3 px-5">
                    <div className="font-mono text-slate-800 dark:text-slate-100 font-medium">{item.poNumber || 'UNMAPPED'}</div>
                    <div className="text-slate-600 dark:text-slate-300 truncate max-w-[180px]" title={item.productTitle}>
                      {item.productTitle}
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{item.sku}</div>
                  </td>

                  {/* Category Badge */}
                  <td className="py-3 px-5 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getBadgeColor(item.type)}`}>
                      {item.type.replace('_', ' ')}
                    </span>
                  </td>

                  {/* Units */}
                  <td className="py-3 px-5 text-center whitespace-nowrap">
                    <div className="font-semibold text-slate-800 dark:text-slate-100">
                      <span className="text-[#E11D48] dark:text-rose-400">{item.claimedQty}</span> / <span className="text-[#059669] dark:text-emerald-400">{item.actualQty}</span>
                    </div>
                    <div className="text-[10px] text-[#E11D48] dark:text-rose-400 font-medium">
                      Short: -{item.differenceQty} pcs
                    </div>
                  </td>

                  {/* Disputed Amount */}
                  <td className="py-3 px-5 text-right whitespace-nowrap">
                    <div className="font-bold text-[#BE123C] dark:text-rose-300 text-sm">
                      ₹{item.disputedAmount.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">Claimable</div>
                  </td>

                  {/* Grounds & Evidence */}
                  <td className="py-3 px-5 max-w-xs">
                    <div className="text-slate-800 dark:text-slate-200 font-medium">{item.reason}</div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 italic mt-0.5">{item.evidence}</div>
                  </td>

                </tr>
              ))
            )}

            {/* Blurred Rows & Paywall Card for Free Plan */}
            {isFreePlan && lockedCount > 0 && (
              <>
                <tr className="opacity-30 blur-[1px] select-none pointer-events-none">
                  <td className="py-3 px-5"><div className="w-20 h-4 bg-slate-300 dark:bg-slate-700 rounded" /></td>
                  <td className="py-3 px-5"><div className="w-32 h-4 bg-slate-300 dark:bg-slate-700 rounded" /></td>
                  <td className="py-3 px-5"><div className="w-16 h-4 bg-slate-300 dark:bg-slate-700 rounded-full" /></td>
                  <td className="py-3 px-5 text-center"><div className="w-12 h-4 bg-slate-300 dark:bg-slate-700 rounded mx-auto" /></td>
                  <td className="py-3 px-5 text-right"><div className="w-16 h-4 bg-rose-200 dark:bg-rose-900 rounded ml-auto" /></td>
                  <td className="py-3 px-5"><div className="w-36 h-4 bg-slate-300 dark:bg-slate-700 rounded" /></td>
                </tr>
                <tr className="opacity-20 blur-[2px] select-none pointer-events-none">
                  <td className="py-3 px-5"><div className="w-24 h-4 bg-slate-300 dark:bg-slate-700 rounded" /></td>
                  <td className="py-3 px-5"><div className="w-28 h-4 bg-slate-300 dark:bg-slate-700 rounded" /></td>
                  <td className="py-3 px-5"><div className="w-16 h-4 bg-slate-300 dark:bg-slate-700 rounded-full" /></td>
                  <td className="py-3 px-5 text-center"><div className="w-12 h-4 bg-slate-300 dark:bg-slate-700 rounded mx-auto" /></td>
                  <td className="py-3 px-5 text-right"><div className="w-16 h-4 bg-rose-200 dark:bg-rose-900 rounded ml-auto" /></td>
                  <td className="py-3 px-5"><div className="w-40 h-4 bg-slate-300 dark:bg-slate-700 rounded" /></td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* Paywall Callout Banner when items are locked */}
      {isFreePlan && lockedCount > 0 && (
        <div className="p-6 bg-gradient-to-r from-emerald-50/70 via-teal-50/70 to-emerald-50/70 dark:from-emerald-950/40 dark:via-slate-900 dark:to-emerald-950/40 border-t border-emerald-200/80 dark:border-emerald-800/60 text-center flex flex-col items-center justify-center">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 flex items-center justify-center text-emerald-700 dark:text-emerald-400 mb-3 shadow-sm">
            <Lock className="w-5 h-5 stroke-[2.5]" />
          </div>

          <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-1">
            🔒 {lockedCount} More Disputed Items Hidden (Valued at ₹{lockedAmount.toLocaleString('en-IN')})
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mb-4">
            Free tier displays the top 3 high-impact discrepancies. Upgrade to Starter or Growth to unlock full SKU lines, dark-store city breakdown, and 1-click Excel claim packages.
          </p>

          <button
            onClick={() => openPaywallModal('Complete Line-Item Ledger')}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <span>Unlock All {filtered.length} Discrepancies Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Pagination Footer (For Subscribed Users) */}
      {!isFreePlan && filtered.length > 0 && (
        <div className="px-5 sm:px-6 py-3 bg-[#F8FAFC] dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div>
            Showing <span className="text-slate-800 dark:text-slate-200 font-medium">{startIndex + 1}</span> to{' '}
            <span className="text-slate-800 dark:text-slate-200 font-medium">{endIndex}</span> of{' '}
            <span className="text-slate-800 dark:text-slate-200 font-medium">{filtered.length}</span> disputed items
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(safeCurrentPage - 1)}
              disabled={safeCurrentPage <= 1}
              className={`inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                safeCurrentPage <= 1
                  ? 'border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed bg-slate-50 dark:bg-slate-900'
                  : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 bg-white dark:bg-slate-900 shadow-2xs cursor-pointer'
              }`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            {/* Page number indicators */}
            <div className="flex items-center space-x-1 px-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                if (
                  pageNum === 1 || 
                  pageNum === totalPages || 
                  (pageNum >= safeCurrentPage - 1 && pageNum <= safeCurrentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        safeCurrentPage === pageNum
                          ? 'bg-[#059669] text-white shadow-xs'
                          : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                } else if (
                  pageNum === safeCurrentPage - 2 || 
                  pageNum === safeCurrentPage + 2
                ) {
                  return <span key={pageNum} className="text-slate-400 dark:text-slate-600 px-0.5">...</span>;
                }
                return null;
              })}
            </div>

            <button
              onClick={() => handlePageChange(safeCurrentPage + 1)}
              disabled={safeCurrentPage >= totalPages}
              className={`inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                safeCurrentPage >= totalPages
                  ? 'border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed bg-slate-50 dark:bg-slate-900'
                  : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 bg-white dark:bg-slate-900 shadow-2xs cursor-pointer'
              }`}
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Support Dispute Letter Modal */}
      {showLetterModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center space-x-2">
                  <Send className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Platform Vendor Support Dispute Dossier</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Pre-formatted official claim letter compliant with quick-commerce vendor SLA guidelines.
                </p>
              </div>
              <button
                onClick={() => setShowLetterModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-sm p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="mb-3 flex items-center space-x-2">
              <label className="text-xs text-slate-600 dark:text-slate-300 font-medium">Your Brand Name:</label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-emerald-500 shadow-2xs"
              />
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 font-mono text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
              {generateDisputeClaimLetter(detectedPlatform, filtered, brandName)}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-[11px] text-slate-400">
                Attach the generated Excel dispute ledger along with this draft to partner support.
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowLetterModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={handleCopyLetter}
                  className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition-all cursor-pointer"
                >
                  {copiedLetter ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLetter ? 'Copied to Clipboard!' : 'Copy Letter Draft'}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
