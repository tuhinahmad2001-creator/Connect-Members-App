/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type GatewayStatus = 'disconnected' | 'connecting' | 'connected' | 'error';
export type MessageChannel = 'sim' | 'whatsapp';
export type MessageStatus = 'queued' | 'sending' | 'sent' | 'failed';

export interface BangladeshiSIM {
  id: string;
  phoneNumber: string; // Bangladeshi number, e.g. +88017XXXXXXXX
  operator: 'Grameenphone' | 'Robi' | 'Airtel' | 'Banglalink' | 'Teletalk';
  signalStrength: number; // 1-5 bars
  portCode: string; // e.g., COM3, /dev/ttyUSB0, dev/bluetooth-rf
  isActive: boolean;
}

export interface MemberRow {
  id: string;
  name: string;
  phone: string;
  dues: number; // monthly dues or customized values
  referenceMonth: string;
  customMessageText?: string;
  status?: string; // status details
}

export interface CampaignLog {
  id: string;
  recipientName: string;
  recipientPhone: string;
  message: string;
  channel: MessageChannel;
  status: MessageStatus;
  timestamp: string;
  errorMessage?: string;
}

export interface AppTemplate {
  id: string;
  title: string;
  body: string;
}
