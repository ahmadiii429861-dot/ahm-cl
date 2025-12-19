
export interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: Date;
}

export interface SmartResponse {
  explanation: string;
  steps: string[];
  visualData?: {
    label: string;
    points: { x: number; y: number }[];
  };
}

export enum CalculatorState {
  Idle = 'idle',
  Calculating = 'calculating',
  Error = 'error'
}
