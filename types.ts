export interface AddressRow {
  [key: string]: any;
}

export interface NormalizedData {
  original: string;
  normalized: string;
  city: string;
  isChanged: boolean;
  originalRow: AddressRow;
  complement?: string;
  status?: 'OK' | 'Revisar' | 'Error';
}

export interface ProcessingStats {
  total: number;
  changed: number;
  percentage: number;
}
