/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Play, Pause, Trash2, Send, HelpCircle, ChevronRight, CheckCircle, Smartphone, MessageSquare } from 'lucide-react';
import { MemberRow, CampaignLog, BangladeshiSIM, MessageChannel } from '../types';

interface SenderQueueProps {
  members: MemberRow[];
  activeSim: BangladeshiSIM | undefined;
  activeTemplateBody: string;
  onCampaignComplete: (logs: CampaignLog[]) => void;
}

export default function SenderQueue({ members, activeSim, activeTemplateBody, onCampaignComplete }: SenderQueueProps) {
  const [channel, setChannel] = useState<MessageChannel>('sim');
  const [sendingState, setSendingState] = useState<'idle' | 'sending' | 'paused'>('idle');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [delaySec, setDelaySec] = useState(2); // delay seconds to protect physical SIM from mobile operator rate limiting
  const [logs, setLogs] = useState<CampaignLog[]>([]);

  // Web API / WhatsApp URL trigger helper
  const triggerWhatsAppWebLink = (phone: string, message: string) => {
    const encodedMsg = encodeURIComponent(message);
    const standardPhone = phone.replace(/[^\d]/g, '');
    const waUrl = `https://web.whatsapp.com/send?phone=${standardPhone}&text=${encodedMsg}`;
    
    // We open in a small mock status or standard browser window
    window.open(waUrl, '_blank');
  };

  useEffect(() => {
    let timer: any;
    if (sendingState === 'sending' && currentIndex < members.length) {
      timer = setTimeout(() => {
        const item = members[currentIndex];
        
        // Generate actual message payload using template placeholding
        let dynamicMsg = activeTemplateBody
          .replace(/{{Name}}/g, item.name)
          .replace(/{{Phone}}/g, item.phone)
          .replace(/{{Dues}}/g, String(item.dues))
          .replace(/{{Month}}/g, item.referenceMonth);

        // Simulated sending logic through GSM stack or WhatsApp
        const isSuccess = Math.random() > 0.05; // 95% simulator success probability
        const timestampVal = new Date().toLocaleString();

        const newLogItem: CampaignLog = {
          id: `log-${Date.now()}-${currentIndex}`,
          recipientName: item.name,
          recipientPhone: item.phone,
          message: dynamicMsg,
          channel: channel,
          status: isSuccess ? 'sent' : 'failed',
          timestamp: timestampVal,
          errorMessage: isSuccess ? undefined : 'সিম রেসপন্স টাইমআউট (Gateway SIM response timeout)'
        };

        setLogs((prev) => [newLogItem, ...prev]);

        // If WhatsApp, also trigger direct browser request for user
        if (channel === 'whatsapp' && isSuccess) {
          triggerWhatsAppWebLink(item.phone, dynamicMsg);
        }

        const nextIndex = currentIndex + 1;
        setCurrentIndex(nextIndex);

        if (nextIndex >= members.length) {
          setSendingState('idle');
          onCampaignComplete([newLogItem, ...logs]);
        }
      }, delaySec * 1000);
    }
    return () => clearTimeout(timer);
  }, [sendingState, currentIndex, members, channel, activeTemplateBody, delaySec]);

  const handleStartSending = () => {
    if (members.length === 0) return;
    if (channel === 'sim' && !activeSim) {
      alert('অনুগ্রহ করে ফোনের সিম নির্বাচন বা এনলিস্ট করুন!');
      return;
    }
    setSendingState('sending');
  };

  const handlePauseSending = () => {
    setSendingState('paused');
  };

  const handleResetQueue = () => {
    setSendingState('idle');
    setCurrentIndex(0);
    setLogs([]);
  };

  const completedPct = members.length > 0 ? Math.round((currentIndex / members.length) * 100) : 0;

  return (
    <div id="sender-queue-section" className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col gap-5 text-slate-100">
      
      {/* Top selection channel of messages */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-850 pb-4">
        <div>
          <h2 className="text-sm font-bold text-slate-200">মেসেজ ট্রান্সফার মেথড ও ডিসপ্যাচার</h2>
          <p className="text-xs text-slate-400">নিচে মেসেজ পাঠানোর উপযুক্ত মাধ্যমটি নির্বাচন করুন:</p>
        </div>

        {/* Tab configuration */}
        <div id="unified-tabs-navigation" className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setChannel('sim')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition ${
              channel === 'sim' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            মোবাইল সিম (Direct SMS)
          </button>
          
          <button
            onClick={() => setChannel('whatsapp')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition ${
              channel === 'whatsapp' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            হোয়াটসএপ (WhatsApp Web)
          </button>
        </div>
      </div>

      {/* Grid Layout of parameters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Status panel */}
        <div className="bg-slate-950/40 border border-slate-800/60 p-4 rounded-xl flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">এক্টিভ সিম গেটওয়ে:</span>
            {channel === 'sim' ? (
              <p className="text-xs font-bold text-slate-200 mt-1">
                {activeSim ? `${activeSim.operator} (${activeSim.phoneNumber})` : 'কোনো সক্রিয় সিম পাওয়া যায়নি'}
              </p>
            ) : (
              <p className="text-xs font-bold text-emerald-400 mt-1">হোয়াটসএপ ওয়েব রাউটিং মডিউল</p>
            )}
            
            <div className="mt-4">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">মেসেজ ডিসপ্যাচ কুল-ডাউন বিরতি:</span>
              <div className="flex items-center gap-1.5 mt-1">
                <input
                  id="cooldown-delay-slider"
                  type="range"
                  min="1"
                  max="10"
                  value={delaySec}
                  onChange={(e) => setDelaySec(parseInt(e.target.value))}
                  className="flex-1 cursor-pointer accent-emerald-500"
                />
                <span className="text-xs font-mono text-slate-300 whitespace-nowrap">{delaySec} সে.</span>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 italic mt-3 flex items-center gap-1">
            <HelpCircle className="w-3 h-3 text-slate-400 shrink-0" />
            <span>সিমের ব্রডকাস্ট ব্লক এড়াতে বিরতি বাড়িয়ে রাখুন।</span>
          </div>
        </div>

        {/* Live progress indicators */}
        <div className="bg-slate-950/40 border border-slate-800/60 p-4 rounded-xl flex flex-col justify-center">
          <div className="text-center">
            <span className="text-4xl font-mono font-bold text-emerald-400">
              {currentIndex} <span className="text-xs text-slate-500">/ {members.length}</span>
            </span>
            <p className="text-xs text-slate-400 mt-1">মোট মেসেজ পাঠানো হয়েছে</p>
          </div>

          <div className="w-full bg-slate-900 rounded-full h-2 mt-4 overflow-hidden border border-slate-800">
            <div
              className={`h-full transition-all duration-300 ${channel === 'sim' ? 'bg-blue-500' : 'bg-emerald-500'}`}
              style={{ width: `${completedPct}%` }}
            />
          </div>
          <p className="text-right text-[10px] text-slate-500 font-mono mt-1">{completedPct}% সম্পন্ন</p>
        </div>

        {/* Start/Stop dispatch control console - complying with target CSS elements styles */}
        <div className="bg-slate-950/40 border border-slate-800/60 p-4 rounded-xl flex flex-col justify-center gap-2.5">
          {sendingState === 'sending' ? (
            <button
              onClick={handlePauseSending}
              className="w-full bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs py-2 px-4 rounded-lg flex items-center justify-center gap-1.5 transition duration-100 active:scale-95 cursor-pointer"
            >
              <Pause className="w-4 h-4" /> বিরতি দিন (Pause Sending)
            </button>
          ) : (
            <button
              onClick={handleStartSending}
              disabled={members.length === 0}
              className="w-full text-white font-semibold text-xs py-2 px-4 rounded-lg flex items-center justify-center gap-1.5 transition duration-100 active:scale-95 disabled:opacity-40 disabled:hover:bg-indigo-600 active:bg-blue-800 cursor-pointer"
              style={{ backgroundColor: '#0046c2' }} // Applying focus selector requested properties
            >
              <Play className="w-4 h-4" /> মেসেজ পাঠানো শুরু করুন
            </button>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleResetQueue}
              className="text-white font-medium text-[11px] py-1.5 px-3 rounded flex items-center justify-center gap-1 border border-red-900 transition hover:bg-red-950 cursor-pointer"
              style={{ backgroundColor: '#ff0000' }} // Applying focus selector requested red color
            >
              <Trash2 className="w-3.5 h-3.5" /> রিসেট করুন
            </button>

            <button
              onClick={() => {
                // Manual single test send trigger
                if (members.length > 0) {
                  const targetMsg = activeTemplateBody
                    .replace(/{{Name}}/g, members[0].name)
                    .replace(/{{Phone}}/g, members[0].phone)
                    .replace(/{{Dues}}/g, String(members[0].dues))
                    .replace(/{{Month}}/g, members[0].referenceMonth);
                  
                  if (channel === 'whatsapp') {
                    triggerWhatsAppWebLink(members[0].phone, targetMsg);
                  } else {
                    alert(`সিম গেটওয়ের মাধ্যমে টেস্ট বার্তা সফলভাবে পাঠানো হয়েছে:\n${targetMsg}`);
                  }
                }
              }}
              disabled={members.length === 0}
              className="text-white font-semibold text-[11px] py-1.5 px-3 rounded flex items-center justify-center gap-1 border border-emerald-900 transition hover:bg-emerald-800 cursor-pointer"
              style={{ backgroundColor: '#009c27' }} // Dynamic green style requested by CSS properties
            >
              <Send className="w-3.5 h-3.5" /> টেস্ট পাঠান
            </button>
          </div>
        </div>
      </div>

      {/* Continuous streaming logs feedback console */}
      {logs.length > 0 && (
        <div className="border border-slate-800 rounded-lg bg-slate-950/70 p-4 font-mono text-[11px]">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1 mb-2 font-sans">
            <ChevronRight className="w-4 h-4 text-blue-400" />
            লাইভ ডিসপ্যাচ সিকোয়েন্স লগ (Live Messaging Stream logs):
          </span>
          <div className="overflow-y-auto max-h-40 space-y-1.5 scrollbar-thin">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start justify-between gap-3 text-slate-300 py-1 border-b border-slate-900/40">
                <div className="flex items-start gap-2 max-w-lg">
                  <span className={`text-[9px] font-bold px-1 rounded uppercase shrink-0 mt-0.5 ${log.channel === 'sim' ? 'bg-blue-950 text-blue-300' : 'bg-emerald-950 text-emerald-300'}`}>
                    {log.channel === 'sim' ? 'SIM' : 'WA'}
                  </span>
                  <div>
                    <span className="text-slate-400 font-semibold">{log.recipientName} ({log.recipientPhone}):</span>{' '}
                    <span className="text-slate-500 italic text-[10px] break-all">{log.message}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className={`inline-flex items-center gap-1 font-semibold ${log.status === 'sent' ? 'text-emerald-400' : 'text-rose-450 text-red-400'}`}>
                    {log.status === 'sent' ? <CheckCircle className="w-3 h-3" /> : '✖'}
                    {log.status === 'sent' ? 'পাঠানো হয়েছে (Sent)' : 'ব্যর্থ (Failed)'}
                  </span>
                  <p className="text-[9px] text-slate-600 font-mono">{log.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
