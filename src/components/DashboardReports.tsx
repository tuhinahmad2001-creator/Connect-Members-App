/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Calendar, Search, Filter, Trash2, Send, Download, BarChart2, MessageSquare, Info, ShieldAlert } from 'lucide-react';
import { CampaignLog, MessageChannel } from '../types';

interface DashboardReportsProps {
  logs: CampaignLog[];
  onClearLogs: () => void;
}

export default function DashboardReports({ logs, onClearLogs }: DashboardReportsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [channelFilter, setChannelFilter] = useState<'all' | 'sim' | 'whatsapp'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'sent' | 'failed'>('all');

  const handleDownloadCSV = () => {
    if (logs.length === 0) return;
    const headers = 'Recipient Name, Phone, Message, Channel, Status, Timestamp\n';
    const rows = logs
      .map((l) => `"${l.recipientName}","${l.recipientPhone}","${l.message.replace(/"/g, '""')}","${l.channel}","${l.status}","${l.timestamp}"`)
      .join('\n');
    
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const link = document.createElement('a');
    link.download = `connect-members-report-${new Date().toLocaleDateString()}.csv`;
    link.href = URL.createObjectURL(blob);
    link.click();
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = log.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.recipientPhone.includes(searchTerm) || 
                          log.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesChannel = channelFilter === 'all' || log.channel === channelFilter;
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    return matchesSearch && matchesChannel && matchesStatus;
  });

  // Calculate detailed summary statistics
  const totalSMS = logs.filter((l) => l.channel === 'sim').length;
  const totalWA = logs.filter((l) => l.channel === 'whatsapp').length;
  const sentSuccess = logs.filter((l) => l.status === 'sent').length;
  const sentFailed = logs.filter((l) => l.status === 'failed').length;
  const successRate = logs.length > 0 ? Math.round((sentSuccess / logs.length) * 100) : 100;

  return (
    <div id="analytics-reports-section" className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col gap-6 text-slate-100">
      
      {/* Title */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-4 border-b border-slate-850">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-indigo-400" />
            রিপোর্ট গ্যালারি ও মেসেজ হিস্টোরি (Activity Reports logs)
          </h2>
          <p className="text-xs text-slate-400 mt-1">তারিখ ভিত্তিক প্রেরিত বার্তার ডাটাবেজ ফিল্টারিং এবং পরিসংখ্যানের ড্যাশবোর্ড</p>
        </div>

        {logs.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={handleDownloadCSV}
              className="bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition"
            >
              <Download className="w-3.5 h-3.5" /> CSV রিপোর্ট ডাউনলোড
            </button>
            <button
              onClick={onClearLogs}
              className="bg-rose-950 hover:bg-rose-900 border border-rose-900 text-rose-300 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition"
            >
              <Trash2 className="w-3.5 h-3.5" /> হিস্টোরি মুছুন
            </button>
          </div>
        )}
      </div>

      {/* Analytics highlights counts cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-950/40 border border-slate-800/60 p-3.5 rounded-xl text-center">
          <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">সর্বমোট প্রেরিতবার্তা:</span>
          <p className="text-2xl font-bold font-mono text-slate-150 mt-1">{logs.length}</p>
          <span className="text-[9px] text-slate-650 text-slate-450 block mt-0.5">সব চ্যানেল মিলিয়ে</span>
        </div>

        <div className="bg-slate-950/40 border border-slate-800/60 p-3.5 rounded-xl text-center">
          <span className="text-emerald-500 text-[10px] uppercase font-bold tracking-wider">সফল ডেলিভারি:</span>
          <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">{sentSuccess}</p>
          <span className="text-[9px] text-emerald-600 block mt-0.5">{successRate}% ডেলিভারি রেট</span>
        </div>

        <div className="bg-slate-950/40 border border-slate-800/60 p-3.5 rounded-xl text-center">
          <span className="text-rose-450 text-red-400 text-[10px] uppercase font-bold tracking-wider">ডেলিভারি ব্যর্থতা:</span>
          <p className="text-2xl font-bold font-mono text-red-400 mt-1">{sentFailed}</p>
          <span className="text-[9px] text-slate-500 block mt-0.5">রিসাইকেলযোগ্য ত্রুটি</span>
        </div>

        <div className="bg-slate-950/40 border border-slate-800/60 p-3.5 rounded-xl text-center">
          <span className="text-indigo-400 text-[10px] uppercase font-bold tracking-wider">চ্যানেল ডিস্ট্রিবিউশন:</span>
          <div className="flex items-center justify-center gap-3 mt-2 text-[10px] font-semibold text-slate-300 font-mono">
            <span>সিম: {totalSMS}</span>
            <span>WA: {totalWA}</span>
          </div>
        </div>
      </div>

      {/* Grid mapping inputs */}
      <div className="bg-slate-950/40 border border-slate-800/50 p-4 rounded-xl flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:flex-1">
          <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-500" />
          <input
            id="reports-filter-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="সদস্যের নাম বা বডি টেক্সটের প্যারামিটার দিয়ে খুঁজুন..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-300 outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap gap-2 shrink-0">
          {/* Channel selector */}
          <select
            id="reports-channel-filter"
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded px-2 px-3 py-1.5 text-xs outline-none cursor-pointer"
          >
            <option value="all">সব মাধ্যম (All Channels)</option>
            <option value="sim">মোবাইল সিম (Direct SMS)</option>
            <option value="whatsapp">হোয়াটসএপ (WhatsApp)</option>
          </select>

          {/* Status selector */}
          <select
            id="reports-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded px-3 py-1.5 text-xs outline-none cursor-pointer"
          >
            <option value="all">সব স্ট্যাটাস</option>
            <option value="sent">সফলভাবে প্রেরিত (Success)</option>
            <option value="failed">ব্যর্থ ডেলিভারি (Failed)</option>
          </select>
        </div>
      </div>

      {/* Log list elements render */}
      <div className="border border-slate-800 rounded-lg bg-slate-950/20 p-3 min-h-40 max-h-80 overflow-y-auto">
        {filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-slate-500 text-center">
            <Info className="w-8 h-8 text-slate-650 opacity-40 mb-2" />
            <p className="text-xs">কোনো পাঠানো বার্তার হিস্টোরি রেকর্ড পাওয়া যায়নি।</p>
            <p className="text-[10px] text-slate-600 mt-0.5">প্রথম পেজে মেসেজ পাঠানো শুরু করলে এখানে তারিখ অনুযায়ী হিস্টোরি দেখাবে।</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredLogs.map((log) => (
              <div key={log.id} className="p-3 bg-slate-950/60 border border-slate-850 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs hover:border-slate-800 transition">
                <div className="flex items-start gap-2.5">
                  <div className={`p-1.5 rounded-md ${
                    log.channel === 'sim' ? 'bg-blue-950/60 text-blue-400' : 'bg-emerald-950/60 text-emerald-400'
                  }`}>
                    {log.channel === 'sim' ? 'SIM' : 'WA'}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-200">
                      সদস্য: {log.recipientName} ({log.recipientPhone})
                    </h4>
                    <p className="text-slate-400 mt-1 font-mono text-[11px] leading-relaxed break-all bg-slate-950 p-2 rounded-md border border-slate-900/60">{log.message}</p>
                    {log.errorMessage && (
                      <p className="text-[10px] text-red-400 font-semibold mt-1 flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        ত্রুটি: {log.errorMessage}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0 flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                    log.status === 'sent' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900' : 'bg-red-950 text-red-400 border border-red-900'
                  }`}>
                    {log.status === 'sent' ? 'Sent (সফল)' : 'Failed (ব্যর্থ)'}
                  </span>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-600" />
                    {log.timestamp}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
