import React from 'react';
import { MemberSettlement, MessSummary } from '../types';
import { SettlementTable } from './SettlementTable';
import { MemberProfileExplorer } from './MemberProfileExplorer';
import { AuditBanner } from './AuditBanner';
import { Scale, Download, Share2, Printer, CheckCheck, FileText } from 'lucide-react';

interface SettlementViewProps {
  memberSettlements: MemberSettlement[];
  summary: MessSummary;
  selectedMemberId: string;
  onSelectMember: (id: string) => void;
  onToggleSettled: (id: string) => void;
  onOpenPrintSlip: (memberSettlement: MemberSettlement) => void;
  onOpenPdfReport: () => void;
  onOpenWhatsApp: () => void;
  onExportCSV: () => void;
  onMarkAllCleared: () => void;
}

export const SettlementView: React.FC<SettlementViewProps> = ({
  memberSettlements,
  summary,
  selectedMemberId,
  onSelectMember,
  onToggleSettled,
  onOpenPrintSlip,
  onOpenPdfReport,
  onOpenWhatsApp,
  onExportCSV,
  onMarkAllCleared,
}) => {
  return (
    <div className="space-y-6">
      {/* Top Banner and Actions */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Scale className="w-5 h-5 text-emerald-600" />
            <span>⚖️ Member Reconciliation & Settlement Hub</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time balance sheet: Meal Cost (Meals × Bazaar Meal Rate) + Other Bills Shared Split = Total Cost vs Total Deposit.
          </p>
          <div className="mt-1.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-[11px] font-semibold text-emerald-900">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            <span>Accounting Rule: Only Mess Bazaar calculates Meal Rate. All other bills are shared split.</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Download PDF All Sheets Button */}
          <button
            onClick={onOpenPdfReport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-2xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Download PDF (All Sheets)</span>
          </button>

          <button
            onClick={onOpenWhatsApp}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-700" />
            <span>WhatsApp Memo</span>
          </button>

          <button
            onClick={onExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-300"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onMarkAllCleared}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-300"
          >
            <CheckCheck className="w-3.5 h-3.5 text-slate-600" />
            <span>Toggle All Cleared</span>
          </button>
        </div>
      </div>

      {/* Audit Banner */}
      <AuditBanner summary={summary} />

      {/* ⚖️ Master Reconciliation & Live Settlement Manager Table */}
      <SettlementTable
        memberSettlements={memberSettlements}
        summary={summary}
        selectedMemberId={selectedMemberId}
        onSelectMember={onSelectMember}
        onToggleSettled={onToggleSettled}
        onOpenPrintSlip={onOpenPrintSlip}
        onMarkAllCleared={onMarkAllCleared}
      />

      {/* 👤 Individual Member Statement & Profile Explorer */}
      <MemberProfileExplorer
        memberSettlements={memberSettlements}
        selectedMemberId={selectedMemberId}
        onSelectMember={onSelectMember}
        onToggleSettled={onToggleSettled}
        onOpenPrintSlip={onOpenPrintSlip}
      />
    </div>
  );
};
