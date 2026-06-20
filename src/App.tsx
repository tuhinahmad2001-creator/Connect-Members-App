/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Smartphone, 
  MessageSquare, 
  Sheet, 
  Calendar, 
  Settings, 
  UserPlus, 
  LayoutDashboard, 
  FileSpreadsheet, 
  Network, 
  History, 
  PhoneCall, 
  Volume2, 
  Battery, 
  Search, 
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  CheckCircle,
  Info
} from 'lucide-react';
import { BangladeshiSIM, MemberRow, CampaignLog, AppTemplate } from './types';

// Importing submodules
import SheetsParser from './components/SheetsParser';
import BluetoothUsbBridge from './components/BluetoothUsbBridge';
import SenderQueue from './components/SenderQueue';
import DashboardReports from './components/DashboardReports';

// Preset dynamic members data reflecting typical Bangladeshi phone numbers and dues
const INITIAL_MEMBERS: MemberRow[] = [
  { id: 'm-1', name: 'আব্দুর রহমান (Manager)', phone: '+8801712345678', dues: 1200, referenceMonth: 'জানুয়ারি', status: 'প্রস্তুত' },
  { id: 'm-2', name: 'সাকিব আল হাসান', phone: '+8801998765432', dues: 2500, referenceMonth: 'ফেব্রুয়ারি', status: 'প্রস্তুত' },
  { id: 'm-3', name: 'তামিম ইকবাল', phone: '+8801811112222', dues: 500, referenceMonth: 'মার্চ', status: 'প্রস্তুত' },
  { id: 'm-4', name: 'মুশফিকুর রহিম', phone: '+8801555444333', dues: 5000, referenceMonth: 'মার্চ', status: 'প্রস্তুত' },
  { id: 'm-5', name: 'মাহমুদুল্লাহ রিয়াদ', phone: '+8801333999888', dues: 1000, referenceMonth: 'এপ্রিল', status: 'প্রস্তুত' }
];

const INITIAL_SIM_GATEWAYS: BangladeshiSIM[] = [
  { id: 'sim-gp', phoneNumber: '+8801755566677', operator: 'Grameenphone', signalStrength: 5, portCode: 'COM4 (Smartphone USB)', isActive: true },
  { id: 'sim-robi', phoneNumber: '+8801822334455', operator: 'Robi', signalStrength: 4, portCode: 'COM9 (Modem USB)', isActive: true }
];

export default function App() {
  const [activeTab, setActiveTab ] = useState<'dashboard' | 'sheets' | 'sim' | 'reports'>('dashboard');
  
  // Enlisted SIM cards
  const [sims, setSims] = useState<BangladeshiSIM[]>(() => {
    const cached = localStorage.getItem('connect_members_sims');
    return cached ? JSON.parse(cached) : INITIAL_SIM_GATEWAYS;
  });

  const [activeSimId, setActiveSimId] = useState<string>(() => sims[0]?.id || 'sim-gp');

  // Parsed Members spreadsheet list
  const [members, setMembers] = useState<MemberRow[]>(() => {
    const cached = localStorage.getItem('connect_members_list');
    return cached ? JSON.parse(cached) : INITIAL_MEMBERS;
  });

  // Current active SMS template message body
  const [activeTemplate, setActiveTemplate] = useState<AppTemplate>(() => {
    const cached = localStorage.getItem('connect_members_template');
    return cached ? JSON.parse(cached) : {
      id: 'dues-reminder',
      title: 'মাসিক চাঁদা বকেয়া নোটিশ',
      body: 'সম্মানিত সদস্য {{Name}},\nআজকের তারিখ পর্যন্ত আপনার {{Month}} মাসের বকেয়া চাঁদা {{Dues}} টাকা। অনুগ্রহ করে দ্রুত পরিশোধ করুন। ধন্যবাদ, "কানেক্ট মেম্বার্স"।'
    };
  });

  // Delivery Campaign Logs
  const [logs, setLogs] = useState<CampaignLog[]>(() => {
    const cached = localStorage.getItem('connect_members_logs');
    if (cached) return JSON.parse(cached);
    return [
      {
        id: 'log-preset-1',
        recipientName: 'আব্দুর রহমান (Manager)',
        recipientPhone: '+8801712345678',
        message: 'সম্মানিত সদস্য আব্দুর রহমান (Manager),\nআজকের তারিখ পর্যন্ত আপনার জানুয়ারি মাসের বকেয়া চাঁদা ১২০০ টাকা। অনুগ্রহ করে দ্রুত পরিশোধ করুন। ধন্যবাদ, "কানেক্ট মেম্বার্স"।',
        channel: 'sim',
        status: 'sent',
        timestamp: '6/20/2026, 10:15:30 AM'
      },
      {
        id: 'log-preset-2',
        recipientName: 'সাকিব আল হাসান',
        recipientPhone: '+8801998765432',
        message: 'সম্মানিত সদস্য সাকিব আল হাসান,\nআজকের তারিখ পর্যন্ত আপনার ফেব্রুয়ারি মাসের বকেয়া চাঁদা ২৫০০ টাকা। অনুগ্রহ করে দ্রুত পরিশোধ করুন। ধন্যবাদ, "কানেক্ট মেম্বার্স"।',
        channel: 'whatsapp',
        status: 'sent',
        timestamp: '6/20/2026, 11:20:05 AM'
      }
    ];
  });

  // System variables
  const [time, setTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');

  // Persist state to localstorage
  useEffect(() => {
    localStorage.setItem('connect_members_sims', JSON.stringify(sims));
  }, [sims]);

  useEffect(() => {
    localStorage.setItem('connect_members_list', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem('connect_members_template', JSON.stringify(activeTemplate));
  }, [activeTemplate]);

  useEffect(() => {
    localStorage.setItem('connect_members_logs', JSON.stringify(logs));
  }, [logs]);

  // Tick clock
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const activeSim = sims.find((s) => s.id === activeSimId);

  const handleCampaignComplete = (newLogs: CampaignLog[]) => {
    setLogs((prev) => [...newLogs, ...prev]);
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  return (
    <div id="root" className="min-h-screen bg-[#0a0a0c] text-[#e2e8f0] font-sans flex flex-col antialiased">
      
      {/* 1. Header Desktop Bar adhering to target elements */}
      <header className="h-14 bg-[#141418] border-b border-[#2d2d35] flex items-center justify-between px-6 shrink-0 z-10 sticky top-0">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-[#3b82f6] rounded-md flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
            <Radio className="w-4.5 h-4.5 animate-pulse text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-[#e2e8f0]">Connect Members</h1>
            <p className="text-[10px] text-[#94a3b8] font-mono tracking-wider uppercase">Virtual SMS & WhatsApp Bridge</p>
          </div>
        </div>

        {/* Search header container */}
        <div className="hidden md:flex items-center bg-[#0a0a0c] border border-[#2d2d35] rounded-lg px-3 py-1.5 w-80 text-xs">
          <Search className="w-3.5 h-3.5 text-[#94a3b8] mr-2" />
          <input
            id="global-search-header"
            type="text"
            placeholder="Search files/members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-[#e2e8f0] w-full placeholder-[#94a3b8]"
          />
        </div>

        {/* Right Status layout */}
        <div className="flex items-center gap-5 text-xs text-[#94a3b8] font-mono font-medium">
          <div className="hidden lg:flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[#e2e8f0]">VOL: 85%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Battery className="w-4 h-4 text-emerald-400" />
            <span>BAT: 100%</span>
          </div>
          <span className="text-[#e2e8f0] font-bold">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>
      </header>

      {/* 2. Main Workspace Layout */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        
        {/* Main navigation Sidebar styled as requested in Geometric Balance */}
        <aside className="w-full md:w-64 bg-[#141418] border-b md:border-b-0 md:border-r border-[#2d2d35] flex flex-col shrink-0">
          <div className="p-4 border-b border-[#2d2d35]/60 bg-[#0a0a0c]/20">
            <span className="text-[9px] uppercase font-bold tracking-widest text-[#94a3b8] font-mono">মেনু নেভিগেশন</span>
          </div>

          <nav id="sidebar-app-nav" className="flex flex-row md:flex-col p-2 gap-1 overflow-x-auto md:overflow-x-visible">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex-1 md:flex-none text-left flex items-center gap-2.5 px-4 py-3 rounded-lg text-xs font-semibold cursor-pointer transition ${
                activeTab === 'dashboard'
                  ? 'text-[#3b82f6] bg-[#3b82f6]/5 border-l-4 border-[#3b82f6]'
                  : 'text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-[#1c1c22]'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-[#3b82f6]" />
              <span>মেসেজ ড্যাশবোর্ড (First Page)</span>
            </button>

            <button
              onClick={() => setActiveTab('sheets')}
              className={`flex-1 md:flex-none text-left flex items-center gap-2.5 px-4 py-3 rounded-lg text-xs font-semibold cursor-pointer transition ${
                activeTab === 'sheets'
                  ? 'text-[#3b82f6] bg-[#3b82f6]/5 border-l-4 border-[#3b82f6]'
                  : 'text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-[#1c1c22]'
              }`}
            >
              <Sheet className="w-4 h-4 text-[#3b82f6]" />
              <span>গুগল শীট সিঙ্ক ও ডায়নামিক ডাটা</span>
            </button>

            <button
              onClick={() => setActiveTab('sim')}
              className={`flex-1 md:flex-none text-left flex items-center gap-2.5 px-4 py-3 rounded-lg text-xs font-semibold cursor-pointer transition ${
                activeTab === 'sim'
                  ? 'text-[#3b82f6] bg-[#3b82f6]/5 border-l-4 border-[#3b82f6]'
                  : 'text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-[#1c1c22]'
              }`}
            >
              <Smartphone className="w-4 h-4 text-[#3b82f6]" />
              <span>সিম গেটওয়ে ও কানেক্টিভিটি</span>
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`flex-1 md:flex-none text-left flex items-center gap-2.5 px-4 py-3 rounded-lg text-xs font-semibold cursor-pointer transition ${
                activeTab === 'reports'
                  ? 'text-[#3b82f6] bg-[#3b82f6]/5 border-l-4 border-[#3b82f6]'
                  : 'text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-[#1c1c22]'
              }`}
            >
              <History className="w-4 h-4 text-[#3b82f6]" />
              <span>হিস্টোরি ও এনালাইটিক্স</span>
            </button>
          </nav>

          {/* Sidebar system details info footer */}
          <div className="mt-auto p-4 hidden md:flex flex-col gap-1.5 border-t border-[#2d2d35]/60 bg-[#0a0a0c]/20">
            <span className="text-[10px] font-mono text-[#94a3b8]">OS VERSION: v4.2.0-STABLE</span>
            <div className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[9px] text-[#94a3b8] font-semibold">দ্বিপাক্ষিক প্রোটোকল সচল</span>
            </div>
          </div>
        </aside>

        {/* 3. Central Working Board Area */}
        <main className="flex-grow p-4 md:p-6 overflow-y-auto space-y-6">
          
          {/* Quick Informational Notice Banner info */}
          <div className="bg-[#1c1c22] border border-[#2d2d35] rounded-xl p-4.5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#e2e8f0]">ফোনের ক্যাবল সংযোগ ও চালুর নির্দেশিকা</h4>
                <p className="text-[11px] text-[#94a3b8] mt-0.5">গুগল শীট ইম্পোর্ট করে মেসেজেস পাঠানো শুরু করতে, ফোনে ইউএসবি কেবল যুক্ত করুন অথবা ব্লুটুথ অন করুন।</p>
              </div>
            </div>

            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => setActiveTab('sim')}
                className="bg-[#3b82f6] hover:bg-blue-600 text-white font-semibold text-xs py-1.5 px-3 rounded-lg transition"
              >
                ডিভাইস সংযোগ করুন (Pair Phone)
              </button>
              <button
                onClick={() => {
                  setMembers(INITIAL_MEMBERS);
                  setSims(INITIAL_SIM_GATEWAYS);
                }}
                className="bg-slate-800 text-slate-300 border border-slate-700 py-1.5 px-3 rounded-lg text-xs font-semibold hover:text-white transition"
                title="রিসেট ডেমো মেম্বার ডেটা"
              >
                রিসেট ডেমো ডাটা
              </button>
            </div>
          </div>

          {/* Render Active View Tab segments dynamically */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Dispatch channel console */}
              <SenderQueue 
                members={members} 
                activeSim={activeSim} 
                activeTemplateBody={activeTemplate.body} 
                onCampaignComplete={handleCampaignComplete}
              />

              {/* Members dynamic list dashboard panel with edit functionality */}
              <div className="bg-[#1c1c22] border border-[#2d2d35] rounded-xl p-5 shadow-lg">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#2d2d35]">
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">মেসেজের সদস্য ডাটাবেজ (Active Recipient Members)</h3>
                    <p className="text-xs text-[#94a3b8] mt-0.5">শিট থেকে জেনারেট হওয়া লাইভ বকেয়া তালিকা</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('sheets')}
                    className="bg-slate-900 border border-[#2d2d35] text-xs text-[#e2e8f0] px-3 py-1.5 rounded-lg flex items-center gap-1 font-semibold hover:border-slate-700 transition"
                  >
                    <Sheet className="w-3.5 h-3.5 text-blue-400" /> নতুন শীট ইম্পোর্ট করুন
                  </button>
                </div>

                <div className="overflow-x-auto scrollbar-thin">
                  <table className="w-full text-xs text-left text-slate-300 border-collapse">
                    <thead>
                      <tr className="border-b border-[#2d2d35]/60 bg-[#0a0a0c]/40">
                        <th className="p-3">ক্রমিক</th>
                        <th className="p-3">নাম</th>
                        <th className="p-3">মোবাইল</th>
                        <th className="p-3">মাস</th>
                        <th className="p-3">বকেয়া চাঁদা</th>
                        <th className="p-3">বার্তা টেমপ্লেট কম্পাইল</th>
                        <th className="p-3">অবস্থা</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2d2d35]/40 text-[#94a3b8] font-mono">
                      {members.map((row, idx) => {
                        let compiled = activeTemplate.body
                          .replace(/{{Name}}/g, row.name)
                          .replace(/{{Phone}}/g, row.phone)
                          .replace(/{{Dues}}/g, String(row.dues))
                          .replace(/{{Month}}/g, row.referenceMonth);

                        return (
                          <tr key={row.id} className="hover:bg-[#141418]/50">
                            <td className="p-3 text-slate-500 font-semibold">{idx + 1}</td>
                            <td className="p-3 font-semibold text-slate-200">{row.name}</td>
                            <td className="p-3 text-emerald-400">{row.phone}</td>
                            <td className="p-3 text-blue-300">{row.referenceMonth}</td>
                            <td className="p-3 text-rose-400 font-bold">{row.dues} ৳</td>
                            <td className="p-3 max-w-sm truncate text-[11px] font-sans" title={compiled}>{compiled}</td>
                            <td className="p-3">
                              <span className="text-[10px] bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded border border-indigo-900 font-sans font-semibold">
                                প্রস্তুত (Ready)
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Date based quick-activity historical widgets */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Simulated gateway statistics bar chart placeholder */}
                <div className="bg-[#1c1c22] border border-[#2d2d35] rounded-xl p-5 shadow-lg">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#94a3b8] mb-4">রিসোর্স ও গেটওয়ে লেভেল ইউটিলাইজেশন (Node Metrics):</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs text-slate-300 font-semibold mb-1">
                        <span>সিম SMS প্যাক ব্যালেন্স</span>
                        <span>৯৮% সচল</span>
                      </div>
                      <div className="w-full bg-[#0a0a0c] h-2 rounded-full overflow-hidden border border-[#2d2d35]">
                        <div className="bg-blue-500 h-full w-[98%]" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-slate-300 font-semibold mb-1">
                        <span>USB কমিনিউকেশন সংবেদনশীলতা</span>
                        <span>১০০% স্থায়ী</span>
                      </div>
                      <div className="w-full bg-[#0a0a0c] h-2 rounded-full overflow-hidden border border-[#2d2d35]">
                        <div className="bg-emerald-500 h-full w-[100%]" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-slate-300 font-semibold mb-1">
                        <span>হোয়াটসএপ ওয়েব সেশন সিঙ্ক</span>
                        <span>নিরাপদ সংযোগ</span>
                      </div>
                      <div className="w-full bg-[#0a0a0c] h-2 rounded-full overflow-hidden border border-[#2d2d35]">
                        <div className="bg-indigo-500 h-full w-[85%]" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Date activity logs report */}
                <div className="bg-[#1c1c22] border border-[#2d2d35] rounded-xl p-5 shadow-lg flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#94a3b8] mb-2">তারিখ ভিত্তিক বার্তা প্রেরণ সারসংক্ষেপ:</h3>
                    <p className="text-xs text-slate-400">আজকের জেনারেট ও ব্রডকাস্ট হওয়া সামারি রিপোর্টসমূহ:</p>
                  </div>

                  <div className="py-2 flex items-center justify-between text-xs border-b border-[#2d2d35] mt-3">
                    <span className="font-semibold text-slate-350">আজকের সর্বমোট জেনারেটেড মেসেজ:</span>
                    <span className="font-mono text-emerald-400 font-bold">{members.length}টি</span>
                  </div>
                  <div className="py-2 flex items-center justify-between text-xs border-b border-[#2d2d35]">
                    <span className="font-semibold text-slate-350">সফলভাবে প্রেরিত:</span>
                    <span className="font-mono text-blue-400 font-bold">
                      {logs.filter((l) => l.status === 'sent').length}টি
                    </span>
                  </div>
                  <div className="py-2 flex items-center justify-between text-xs pb-1">
                    <span className="font-semibold text-slate-350">ব্যর্থতা বা এরর সংখ্যা:</span>
                    <span className="font-mono text-rose-450 text-red-500 font-bold">
                      {logs.filter((l) => l.status === 'failed').length}টি
                    </span>
                  </div>

                  <button
                    onClick={() => setActiveTab('reports')}
                    className="mt-4 w-full bg-slate-900 border border-[#2d2d35] hover:border-slate-700 hover:text-white py-1.5 rounded-lg text-xs font-bold font-mono text-[#94a3b8] transition cursor-pointer"
                  >
                    হিস্টোরি ফাইলটি বিস্তারিত ওডিট করুন →
                  </button>
                </div>

              </div>

            </div>
          )}

          {activeTab === 'sheets' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <SheetsParser 
                onDataParsed={(newRows) => setMembers(newRows)} 
                parsedMembers={members}
                activeTemplate={activeTemplate}
                onChangeTemplate={(newText) => setActiveTemplate({ ...activeTemplate, body: newText })}
              />
            </div>
          )}

          {activeTab === 'sim' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <BluetoothUsbBridge 
                onSimsUpdated={(newSims) => setSims(newSims)} 
                enlistedSims={sims} 
                activeSimId={activeSimId} 
                onSelectActiveSim={(id) => setActiveSimId(id)}
              />
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <DashboardReports 
                logs={logs} 
                onClearLogs={handleClearLogs}
              />
            </div>
          )}

        </main>

      </div>

      {/* 4. Bottom Taskbar Dock Status */}
      <footer className="h-14 bg-[#141418] border-t border-[#2d2d35] shrink-0 flex items-center justify-between px-6 text-xs text-[#94a3b8] font-mono z-10 selection-none">
        <div className="flex items-center gap-3">
          <Info className="w-4 h-4 text-emerald-400" />
          <span className="hidden sm:inline font-semibold">সদস্য সংযোগ (Connect Members) নিরাপদ গেটওয়ে প্রোটোকল দ্বারা ব্রডকাস্ট করছে।</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-semibold text-[#e2e8f0]">Active SIM Count: {sims.length}</span>
          <span className="font-semibold text-blue-400">Total Contacts: {members.length}</span>
        </div>
      </footer>

    </div>
  );
}
