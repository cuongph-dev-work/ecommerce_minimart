export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  total: number;
  status: 'pending' | 'processing' | 'delivered' | 'cancelled';
  date: string;
  items: number;
}

export const orders: Order[] = [
  {
    id: 'ORD-001',
    customerName: 'Nguyen Van A',
    customerEmail: 'nguyenvana@example.com',
    total: 1500000,
    status: 'delivered',
    date: '2023-10-25',
    items: 3,
  },
  {
    id: 'ORD-002',
    customerName: 'Tran Thi B',
    customerEmail: 'tranthib@example.com',
    total: 750000,
    status: 'processing',
    date: '2023-10-26',
    items: 1,
  },
  {
    id: 'ORD-003',
    customerName: 'Le Van C',
    customerEmail: 'levanc@example.com',
    total: 2300000,
    status: 'pending',
    date: '2023-10-27',
    items: 5,
  },
  {
    id: 'ORD-004',
    customerName: 'Pham Thi D',
    customerEmail: 'phamthid@example.com',
    total: 450000,
    status: 'cancelled',
    date: '2023-10-24',
    items: 2,
  },
  {
    id: 'ORD-005',
    customerName: 'Hoang Van E',
    customerEmail: 'hoangvane@example.com',
    total: 1200000,
    status: 'delivered',
    date: '2023-10-23',
    items: 4,
  },
];
