/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sheet, ClipboardCopy, Plus, Trash2, HelpCircle, FileText, CheckCircle2, ChevronRight, RefreshCw } from 'lucide-react';
import { MemberRow, AppTemplate } from '../types';

interface SheetsParserProps {
  onDataParsed: (rows: MemberRow[]) => void;
  parsedMembers: MemberRow[];
  activeTemplate: AppTemplate;
  onChangeTemplate: (newBody: string) => void;
}

const TEMPLATE_PRESETS: AppTemplate[] = [
  {
    id: 'dues-reminder',
    title: 'মাসিক চাঁদা বকেয়া নোটিশ (Dues Reminder)',
    body: 'সম্মানিত সদস্য {{Name}},\nআজকের তারিখ পর্যন্ত আপনার {{Month}} মাসের বকেয়া চাঁদা {{Dues}} টাকা। অনুগ্রহ করে দ্রুত পরিশোধ করুন। ধন্যবাদ, "কানেক্ট মেম্বার্স"।'
  },
  {
    id: 'general-notice',
    title: 'জরুরী সভা আহ্বান (General Meeting Notification)',
    body: 'অভিনন্দন {{Name}},\nআগামী শুক্রবার আমাদের "কানেক্ট মেম্বার্স" ক্লাবে একটি সভা অনুষ্ঠিত হবে। উপস্থিত থাকার জন্য বিনীত অনুরোধ রইল। বকেয়া চাঁদা {{Dues}} টাকা।'
  },
  {
    id: 'custom-single',
    title: 'সাধারণ শুভেচ্ছা বার্তা (Greeting Info)',
    body: 'প্রিয় {{Name}},\n"কানেক্ট মেম্বার্স" এর পক্ষ থেকে আপনাকে শুভেচ্ছা। আপনার নিয়মিত যোগাযোগের নম্বর: {{Phone}}।'
  }
];

export default function SheetsParser({ onDataParsed, parsedMembers, activeTemplate, onChangeTemplate }: SheetsParserProps) {
  const [pasteData, setPasteData] = useState('');
  const [columnMapping, setColumnMapping] = useState({
    name: 0,
    phone: 1,
    dues: 2,
    month: 3
  });
  const [customHeaders, setCustomHeaders] = useState<string[]>([]);
  const [errorText, setErrorText] = useState('');

  // Sample copy-paste content representing a Google Sheet dataset for Bengali users
  const handleLoadDemoData = () => {
    const demoTSV = `সদস্যের নাম\tমোবাইল নম্বর\tবকেয়া পরিমাণ\tমাস\nআব্দুর রহমান\t+8801712345678\t১০০০\tজানুয়ারি\nসাকিব আল হাসান\t+8801998765432\t১৫০০\tফেব্রুয়ারি\nতামিম ইকবাল\t+8801811112222\t৫০০\tমার্চ\nমুশফিকুর রহিম\t+8801555444333\t২০০\tজানুয়ারি\nমাহমুদুল্লাহ রিয়াদ\t+8801333999888\t২৫০০\tএপ্রিল`;
    setPasteData(demoTSV);
    parseSheetText(demoTSV);
  };

  const parseSheetText = (text: string) => {
    if (!text.trim()) {
      setErrorText('অনুগ্রহ করে গুগল শীট থেকে কপি করা তথ্য পেস্ট করুন।');
      return;
    }
    setErrorText('');

    try {
      const lines = text.trim().split('\n');
      if (lines.length < 1) {
        throw new Error('আপনার পেস্ট করা লেখায় কোনো লাইন পাওয়া যায়নি।');
      }

      // Detect header row or create default headers
      const rawHeaders = lines[0].split('\t');
      const isHeaderRow = isNaN(Number(rawHeaders[1])); // Check if second column looks like data or header
      
      let startIdx = 0;
      let headersList: string[] = [];

      if (isHeaderRow) {
        headersList = rawHeaders.map((h) => h.trim());
        startIdx = 1;
      } else {
        // Fallback generic headers
        headersList = ['কলাম A', 'কলাম B', 'কলাম C', 'কলাম D'];
      }
      setCustomHeaders(headersList);

      const computedRows: MemberRow[] = [];
      for (let i = startIdx; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const cols = lines[i].split('\t').map(c => c.trim().replace(/"/g, ''));

        // extract numbers safely
        const rawPhone = cols[columnMapping.phone] || cols[1] || '';
        const phoneClean = rawPhone.replace(/[^\d+]/g, ''); // strip spaces, keep + and numbers
        const cleanDues = parseFloat((cols[columnMapping.dues] || cols[2] || '0').replace(/[^\d]/g, '')) || 0;

        computedRows.push({
          id: `member-${i}-${Date.now()}`,
          name: cols[columnMapping.name] || cols[0] || 'Unknown Member',
          phone: phoneClean.startsWith('0') ? `+88${phoneClean}` : phoneClean,
          dues: cleanDues,
          referenceMonth: cols[columnMapping.month] || cols[3] || 'বর্তমান মাস'
        });
      }

      if (computedRows.length === 0) {
        throw new Error('কোনো ভ্যালিড সদস্য তথ্য পাওয়া যায়নি।');
      }

      onDataParsed(computedRows);
    } catch (err: any) {
      setErrorText(`ডিকোড ত্রুটি: ${err.message || 'ভুল ফরম্যাট'}`);
    }
  };

  return (
    <div id="sheets-parser-section" className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col gap-6 text-slate-100">
      
      {/* App Headline Banner info */}
      <div className="flex items-start gap-4">
        <div className="p-3 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 text-emerald-400 rounded-lg border border-emerald-500/30">
          <Sheet className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            গুগল শীট ড্যাশবোর্ড ইন্টিগ্রেশন <span className="text-xs bg-emerald-500/20 text-emerald-300 font-semibold px-2 py-0.5 rounded border border-emerald-500/30">Auto Parser</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            আপনার গুগল স্প্রেডশীট বা এক্সেল ফাইল থেকে প্রয়োজনীয় কলামগুলো (নাম, মোবাইল নম্বর, বকেয়া চাদা, মাস) নিচে সরাসরি কপি-পেস্ট করুন। এপস স্বয়ংক্রিয়ভাবে ডাটা ইম্পোর্ট করে নিবে।
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Input Textarea Block */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
            <span className="flex items-center gap-1.5">
              <ClipboardCopy className="w-3.5 h-3.5 text-blue-400" />
              এখানে পেস্ট করুন (TSV/CSV supported):
            </span>
            <button
              onClick={handleLoadDemoData}
              className="text-[11px] bg-indigo-950 text-indigo-300 border border-indigo-800 hover:bg-indigo-900 px-2 py-1 rounded transition flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" /> ডেমো ডাটা লোড করুন
            </button>
          </div>

          <textarea
            id="sheet-pasted-area"
            value={pasteData}
            onChange={(e) => {
              setPasteData(e.target.value);
              parseSheetText(e.target.value);
            }}
            placeholder="গুগল শীটের কলামগুলো কপি ক্লিক (Ctrl+C) করে এখানে পেস্ট (Ctrl+V) করুন...&#10;যেমন:&#10;নাম&#10;মোবাইল নম্বর&#10;বকেয়া পরিমাণ&#10;মাস"
            className="w-full h-44 p-3 bg-slate-950 text-slate-300 border border-slate-800 rounded-lg font-mono text-xs focus:ring-1 focus:ring-emerald-500 outline-none resize-none scrollbar-thin"
          />

          {errorText && (
            <p className="text-xs text-red-400 mt-1 font-semibold">{errorText}</p>
          )}
        </div>

        {/* Messaging Templates configurations */}
        <div className="flex flex-col gap-3">
          <label className="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            মেসেজের ডায়নামিক টেমপ্লেট নির্বাচন করুন:
          </label>

          {/* Quick preset switch */}
          <div className="grid grid-cols-1 gap-1.5">
            {TEMPLATE_PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => onChangeTemplate(p.body)}
                className={`text-left text-xs p-2.5 rounded-lg border transition ${
                  p.body === activeTemplate.body
                    ? 'bg-blue-950/40 border-blue-500/50 text-slate-100'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-semibold text-xs flex items-center gap-1.5 text-slate-200">
                  <CheckCircle2 className={`w-3.5 h-3.5 ${p.body === activeTemplate.body ? 'text-blue-400' : 'text-slate-600'}`} />
                  {p.title}
                </div>
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-1 mt-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">কাস্টম মেসেজের টেক্সট (বাংলায় লিখতে পারবেন):</span>
            <textarea
              id="raw-template-body-textarea"
              value={activeTemplate.body}
              onChange={(e) => onChangeTemplate(e.target.value)}
              className="w-full h-24 p-2 bg-slate-950 text-emerald-300 border border-slate-800 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 outline-none resize-none"
            />
            <div className="flex flex-wrap gap-1 mt-1.5">
              <span className="text-[9px] text-slate-500 mr-1.5">ডায়নামিক প্লেসহোল্ডার সমূহ:</span>
              {['Name', 'Phone', 'Dues', 'Month'].map((ph) => (
                <button
                  key={ph}
                  onClick={() => onChangeTemplate(activeTemplate.body + ` {{${ph}}}`)}
                  className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded hover:bg-slate-700 transition"
                >
                  +{`{{${ph}}}`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Member preview table list */}
      {parsedMembers.length > 0 && (
        <div className="border border-slate-800 rounded-lg bg-slate-950/50 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
              <ChevronRight className="w-4 h-4 text-emerald-400" />
              পেস্টকৃত মেম্বার লিস্টের প্রিভিউ ({parsedMembers.length} জন):
            </span>
          </div>

          <div className="overflow-x-auto max-h-52 overflow-y-auto">
            <table className="w-full text-xs text-left text-slate-300 border-collapse">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-800">
                  <th className="p-2">ক্রমিক</th>
                  <th className="p-2">সদস্যের নাম</th>
                  <th className="p-2">মোবাইল</th>
                  <th className="p-2">বকেয়া পরিমাণ</th>
                  <th className="p-2">মাস</th>
                  <th className="p-2 w-96">জেনারেট হওয়া মেসেজ প্রিভিউ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/60 font-mono">
                {parsedMembers.map((row, idx) => {
                  // Pre-built custom compiled preview string of current template
                  let previewMsg = activeTemplate.body
                    .replace(/{{Name}}/g, row.name)
                    .replace(/{{Phone}}/g, row.phone)
                    .replace(/{{Dues}}/g, String(row.dues))
                    .replace(/{{Month}}/g, row.referenceMonth);

                  return (
                    <tr key={row.id} className="hover:bg-slate-900/50">
                      <td className="p-2 text-slate-500">{idx + 1}</td>
                      <td className="p-2 font-semibold text-slate-200">{row.name}</td>
                      <td className="p-2 text-emerald-400">{row.phone}</td>
                      <td className="p-2 text-rose-400">{row.dues} ৳</td>
                      <td className="p-2 text-blue-300">{row.referenceMonth}</td>
                      <td className="p-2 text-slate-400 truncate max-w-sm whitespace-normal text-[10px]" title={previewMsg}>
                        {previewMsg}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
