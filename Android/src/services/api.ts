import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || '';
const API_SECRET = process.env.EXPO_PUBLIC_API_SECRET || '';

async function getCenter(): Promise<string> {
  return (await AsyncStorage.getItem('center')) || 'Puretipalli';
}

async function request<T>(method: string, path: string, body?: any): Promise<T> {
  const center = await getCenter();
  const url = `${API_BASE_URL}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_SECRET}`,
    'Center': center,
  };

  const options: RequestInit = { method, headers };
  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API Error ${response.status}: ${text}`);
  }
  const text = await response.text();
  return text ? JSON.parse(text) : ({} as T);
}

// Producer API
export const ProducerApi = {
  getAll: (status: 'active' | 'all' = 'active') =>
    request<IProducer[]>('GET', `/api/producer/${status}`),

  create: (producer: Omit<IProducer, '_id'>) =>
    request<{ data: string }>('POST', '/api/producer', producer),

  update: (producer: IProducer) =>
    request<{ data: string }>('PUT', '/api/producer', producer),

  deactivate: (id: string) =>
    request<{ data: string }>('DELETE', `/api/producer/${id}`),

  bulkUpdate: (producers: IProducer[]) => {
    const ops = producers.map(p =>
      p._id
        ? { updateOne: { filter: { _id: p._id }, update: p, upsert: true } }
        : { insertOne: { document: p } }
    );
    return request<{ data: string }>('POST', '/api/producer/bulk', ops);
  },
};

// Procurement API
export const ProcurementApi = {
  getByDateShift: (date: string, shift?: string) => {
    let path = `/api/procurement/${date}`;
    if (shift) path += `/${shift}`;
    return request<IProcurement[]>('GET', path);
  },

  create: (procurement: Omit<IProcurement, '_id'>) =>
    request<{ data: string }>('POST', '/api/procurement', procurement),

  update: (procurement: IProcurement) =>
    request<{ data: string }>('PUT', '/api/procurement', procurement),

  getBill: (fromDate: string, toDate: string, producerCode?: string) => {
    let path = `/api/procurement/bill/${fromDate}/${toDate}`;
    if (producerCode) path += `/${producerCode}`;
    return request<IProcurement[]>('GET', path);
  },

  bulkUpdate: (procurements: IProcurement[]) => {
    const ops = procurements.map(p =>
      p._id
        ? { updateOne: { filter: { _id: p._id }, update: p, upsert: true } }
        : { insertOne: { document: p } }
    );
    return request<{ data: string }>('POST', '/api/procurement/bulk', ops);
  },

  delete: (id: string) =>
    request<{ data: string }>('DELETE', `/api/procurement/${id}`),
};

// Types
export interface IProducer {
  _id?: string;
  code: string;
  name: string;
  active: boolean;
  contactNumber: string;
  bankAccountNumber: string;
  bankIfscCode: string;
  specialRate?: string;
  loanDate?: string;
  loanAmount?: number;
  interestAmount?: number;
  otherAmount?: number;
  loan2Date?: string;
  loan2Amount?: number;
}

export interface IProcurement {
  _id?: string;
  producerCode: string;
  date: string;
  shift: string;
  quantity: number;
  fat: number;
  kgFat: number;
  rate: number;
  premiumRate: number;
  grossAmount: number;
  incentiveRate: number;
  incentiveAmount: number;
  totalAmount: number;
  sampleNumber?: string;
  adjustRate?: boolean;
}
