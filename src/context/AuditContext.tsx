'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { SettlementRow, DiscrepancyItem, AuditSummary, PlatformType } from '@/types/audit';

interface AuditContextType {
  hasData: boolean;
  activeFileName: string;
  detectedPlatform: PlatformType;
  summary: AuditSummary | null;
  discrepancies: DiscrepancyItem[];
  currentView: 'upload' | 'dashboard';
  setCurrentView: (view: 'upload' | 'dashboard') => void;
  saveAuditResult: (
    summary: AuditSummary,
    discrepancies: DiscrepancyItem[],
    platform: PlatformType,
    fileName: string
  ) => void;
  resetAudit: () => void;
}

const AuditContext = createContext<AuditContextType | undefined>(undefined);

export const AuditProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasData, setHasData] = useState(false);
  const [activeFileName, setActiveFileName] = useState('');
  const [detectedPlatform, setDetectedPlatform] = useState<PlatformType>('Blinkit');
  const [summary, setSummary] = useState<AuditSummary | null>(null);
  const [discrepancies, setDiscrepancies] = useState<DiscrepancyItem[]>([]);
  const [currentView, setCurrentView] = useState<'upload' | 'dashboard'>('upload');

  // Hydrate from localStorage on client-side mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('auditpay_current_audit');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.summary && parsed.discrepancies) {
          setSummary(parsed.summary);
          setDiscrepancies(parsed.discrepancies);
          setDetectedPlatform(parsed.platform || 'Blinkit');
          setActiveFileName(parsed.fileName || '');
          setHasData(true);
        }
      }
    } catch (e) {
      console.error('Failed to load saved audit', e);
    }
  }, []);

  const saveAuditResult = (
    newSummary: AuditSummary,
    newDiscrepancies: DiscrepancyItem[],
    newPlatform: PlatformType,
    fileName: string
  ) => {
    setSummary(newSummary);
    setDiscrepancies(newDiscrepancies);
    setDetectedPlatform(newPlatform);
    setActiveFileName(fileName);
    setHasData(true);
    setCurrentView('dashboard');

    try {
      localStorage.setItem(
        'auditpay_current_audit',
        JSON.stringify({
          summary: newSummary,
          discrepancies: newDiscrepancies,
          platform: newPlatform,
          fileName,
        })
      );
    } catch (e) {
      console.error('Failed to persist audit', e);
    }
  };

  const resetAudit = () => {
    setHasData(false);
    setSummary(null);
    setDiscrepancies([]);
    setActiveFileName('');
    setCurrentView('upload');
    try {
      localStorage.removeItem('auditpay_current_audit');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AuditContext.Provider
      value={{
        hasData,
        activeFileName,
        detectedPlatform,
        summary,
        discrepancies,
        currentView,
        setCurrentView,
        saveAuditResult,
        resetAudit,
      }}
    >
      {children}
    </AuditContext.Provider>
  );
};

export const useAudit = () => {
  const context = useContext(AuditContext);
  if (!context) {
    throw new Error('useAudit must be used within an AuditProvider');
  }
  return context;
};
