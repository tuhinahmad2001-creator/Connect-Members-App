/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Bluetooth, Usb, Plus, ShieldCheck, Radio, ToggleLeft, ToggleRight, Trash2, Check, RefreshCw } from 'lucide-react';
import { BangladeshiSIM, GatewayStatus } from '../types';

interface BluetoothUsbBridgeProps {
  onSimsUpdated: (sims: BangladeshiSIM[]) => void;
  enlistedSims: BangladeshiSIM[];
  activeSimId: string;
  onSelectActiveSim: (id: string) => void;
}

export default function BluetoothUsbBridge({ onSimsUpdated, enlistedSims, activeSimId, onSelectActiveSim }: BluetoothUsbBridgeProps) {
  const [phoneInput, setPhoneInput] = useState('+8801755566677');
  const [operatorInput, setOperatorInput] = useState<'Grameenphone' | 'Robi' | 'Airtel' | 'Banglalink' | 'Teletalk'>('Grameenphone');
  const [portInput, setPortInput] = useState('COM4 (Samsung Smartphone USB)');
  const [gatewayStatus, setGatewayStatus] = useState<GatewayStatus>('connected');
  const [connectionMethod, setConnectionMethod] = useState<'USB' | 'Bluetooth'>('USB');
  const [isLoading, setIsLoading] = useState(false);

  // Enlist a new mobile number
  const handleAddSim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneInput.trim()) return;

    let formattedPhone = phoneInput.trim();
    if (formattedPhone.startsWith('0')) {
      formattedPhone = `+88${formattedPhone}`;
    }

    const newSim: BangladeshiSIM = {
      id: `sim-${Date.now()}`,
      phoneNumber: formattedPhone,
      operator: operatorInput,
      signalStrength: Math.floor(Math.random() * 2) + 4, // high strength 4-5
      portCode: portInput,
      isActive: true
    };

    const updated = [...enlistedSims, newSim];
    onSimsUpdated(updated);
    // automatically activate
    onSelectActiveSim(newSim.id);
    setPhoneInput('');
  };

  const handleRemoveSim = (id: string) => {
    const updated = enlistedSims.filter((s) => s.id !== id);
    onSimsUpdated(updated);
    if (activeSimId === id && updated.length > 0) {
      onSelectActiveSim(updated[0].id);
    }
  };

  const toggleSimActive = (id: string) => {
    const updated = enlistedSims.map((s) => 
      s.id === id ? { ...s, isActive: !s.isActive } : s
    );
    onSimsUpdated(updated);
  };

  // Connect / Disconnect emulator toggle
  const handleReconnectBridge = () => {
    setIsLoading(true);
    setGatewayStatus('connecting');
    setTimeout(() => {
      setIsLoading(false);
      setGatewayStatus('connected');
    }, 1500);
  };

  return (
    <div id="connection-bridge-section" className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col gap-5 text-slate-100">
      
      {/* Title */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 text-blue-400 rounded-lg border border-blue-500/30">
            {connectionMethod === 'USB' ? <Usb className="w-5 h-5" /> : <Bluetooth className="w-5 h-5" />}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">সিম ব্যবহারের অনুমতি ও সংযোগ পোর্ট</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              USB ক্যাবল বা ব্লুটুথ সংযোগের মাধ্যমে কম্পিউটার অ্যাপসটি আপনার ফোনের সিম ব্যবহার করে মেসেজ পাঠাবে।
            </p>
          </div>
        </div>

        {/* Live Status indicator */}
        <div className="text-right flex flex-col items-end">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">সংযোগ অবস্থা:</span>
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full mt-1 ${
            gatewayStatus === 'connected' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
            gatewayStatus === 'connecting' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse' :
            'bg-rose-500/10 text-rose-400 border border-rose-500/30'
          }`}>
            <span className={`w-2 h-2 rounded-full ${gatewayStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
            {gatewayStatus === 'connected' ? 'সক্রিয় সংযোগ' : 'কানেক্ট করা হচ্ছে...'}
          </span>
  </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Connection Port Method form column */}
        <div className="bg-slate-950/40 border border-slate-800/60 p-4 rounded-xl flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" /> গেটওয়ে সংযোগ মাধ্যম (Choose Bridge Protocol):
            </span>
            <div className="flex bg-slate-900 border border-slate-800 rounded p-0.5 text-xs">
              <button
                onClick={() => setConnectionMethod('USB')}
                className={`px-2 py-0.5 rounded font-semibold transition ${connectionMethod === 'USB' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                USB
              </button>
              <button
                onClick={() => setConnectionMethod('Bluetooth')}
                className={`px-2 py-0.5 rounded font-semibold transition ${connectionMethod === 'Bluetooth' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Bluetooth
              </button>
            </div>
          </div>

          <div className="text-xs text-slate-300">
            {connectionMethod === 'USB' ? (
              <p>📱 ফোনের ডেটা ক্যাবল দিয়ে পিসির সাথে ইউএসবি ডিবাগিং (USB Debugging) সংযোগ সচল করুন। এটি বেশি নির্ভরযোগ্য ও দ্রুত মেসেজ পাঠাতে উপযোগী।</p>
            ) : (
              <p>🔊 ফোনটির সাথে ব্লুটুথ শেয়ারিং চালু করে পিসির ব্লুটুথ উইন্ডোতে ডিভাইসটি পেয়ার করে নিন।</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">সংযোগকৃত পোর্টের আইডি (e.g., Serial Port COM):</span>
              <input
                id="active-sim-port"
                type="text"
                value={portInput}
                onChange={(e) => setPortInput(e.target.value)}
                className="bg-slate-950 text-slate-300 border border-slate-800 rounded px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={handleReconnectBridge}
              disabled={isLoading}
              className="mt-1 w-full bg-slate-900 hover:bg-slate-850 hover:text-white border border-slate-700 text-slate-300 py-1.5 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              কানেক্টিভিটি পুনরায় যাচাই করুন (Re-examine Connection)
            </button>
          </div>
        </div>

        {/* Bangladeshi SIM enlisting management list */}
        <div className="bg-slate-950/40 border border-slate-800/60 p-4 rounded-xl flex flex-col gap-3">
          <span className="text-xs font-bold text-slate-300">বাংলাদেশী সিম নম্বর এনলিস্টমেন্ট (Enlist SIM cards):</span>
          
          <form onSubmit={handleAddSim} className="flex gap-2">
            <input
              id="bangladeshi-sim-enlist-input"
              type="text"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              placeholder="+88017XXXXXXXX"
              className="flex-1 bg-slate-950 text-slate-300 border border-slate-800 rounded px-2.5 py-1.5 text-xs outline-none"
            />
            
            <select
              id="operator-sim-selector"
              value={operatorInput}
              onChange={(e) => setOperatorInput(e.target.value as any)}
              className="bg-slate-950 text-slate-300 border border-slate-800 rounded px-2.5 py-1 text-xs outline-none text-slate-300 cursor-pointer"
            >
              <option value="Grameenphone">GP</option>
              <option value="Robi">Robi</option>
              <option value="Airtel">Airtel</option>
              <option value="Banglalink">BL</option>
              <option value="Teletalk">TT</option>
            </select>

            <button
              id="add-sim-btn-submit"
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 rounded text-xs font-semibold flex items-center justify-center cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>

          {/* Enlisted list scrollable */}
          <div className="flex-1 overflow-y-auto max-h-36 pr-1 divide-y divide-slate-900/60">
            {enlistedSims.length === 0 ? (
              <p className="text-center text-slate-600 text-xs py-4">কোনো সিম এনলিস্ট করা নাই।</p>
            ) : (
              enlistedSims.map((sim) => (
                <div key={sim.id} className="py-2 flex items-center justify-between text-xs transition hover:bg-slate-900/20">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleSimActive(sim.id)}
                      className="text-slate-400 hover:text-slate-200 transition"
                      title={sim.isActive ? "নিষ্ক্রিয় করুন" : "সক্রিয় করুন"}
                    >
                      {sim.isActive ? (
                        <ToggleRight className="w-5.5 h-5.5 text-emerald-400" />
                      ) : (
                        <ToggleLeft className="w-5.5 h-5.5 text-slate-600" />
                      )}
                    </button>
                    <div>
                      <p className="font-semibold text-slate-200 flex items-center gap-1.5">
                        {sim.phoneNumber}
                        <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded font-normal">
                          {sim.operator}
                        </span>
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono">Port: {sim.portCode}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Signal bars indicator preview */}
                    <div className="flex items-end gap-0.5" title={`${sim.signalStrength} Bars - GP Network Okay`}>
                      {[1, 2, 3, 4, 5].map((bar) => (
                        <div
                          key={bar}
                          className={`w-1 rounded-sm ${
                            bar <= sim.signalStrength ? 'bg-emerald-400' : 'bg-slate-800'
                          }`}
                          style={{ height: `${bar * 3}px` }}
                        />
                      ))}
                    </div>

                    <button
                      onClick={() => handleRemoveSim(sim.id)}
                      className="text-red-400 hover:text-red-300 p-1"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Target CSS Selector 1 Active sim selector dropdown */}
      <div className="border-t border-slate-850 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950/20 p-3 rounded-lg">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="text-xs font-bold text-slate-300">মেসেজ ডিসপ্যাচ করার জন্য সক্রিয় সিম গেটওয়ে নির্বাচন করুন:</span>
        </div>
        
        <select
          id="active-gateway-sim-selector"
          value={activeSimId}
          onChange={(e) => onSelectActiveSim(e.target.value)}
          className="w-full sm:w-60 bg-slate-950 text-slate-100 border border-slate-800 rounded px-3 py-1.5 text-xs font-semibold focus:ring-1 focus:ring-emerald-500 outline-none text-slate-300 cursor-pointer"
        >
          {enlistedSims.map((sim) => (
            <option key={sim.id} value={sim.id}>
              {sim.operator} ({sim.phoneNumber})
            </option>
          ))}
          {enlistedSims.length === 0 && (
            <option value="">কোনো সিম সংযোগযোগ্য নেই</option>
          )}
        </select>
      </div>

    </div>
  );
}
