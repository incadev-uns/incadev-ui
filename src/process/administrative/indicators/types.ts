// src/process/administrative/indicators/types.ts

export type IndicatorStatus = 'achieved' | 'in_progress' | 'at_risk';

export interface Indicator {
  id: string;
  name: string;
  description: string;
  current_value: number;
  goal: number;
  unit: string;
  progress: number;
  difference: number;
  status: IndicatorStatus;
  last_updated: string;
}

export interface IndicatorUpdate {
  goal?: number;
  current_value?: number;
}

export interface IndicatorResponse {
  success: boolean;
  data?: Indicator | Indicator[];
  message?: string;
  error?: string;
}