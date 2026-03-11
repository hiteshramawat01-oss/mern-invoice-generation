export interface User {
  id: string;
  email: string;
  role: "user" | "admin";
}

export interface BusinessDetails {
  shopName: string;
  shopAddress: string;
  shopPhone: string;
  shopEmail: string;
  paymentUPI: string;
  paymentInfo: string;
  paymentQRCode: string;
  logo: string;
  brandColor: string;
}

export interface InvoiceItem {
  id?: string;
  _id?: string;
  description: string;
  quantity: number;
  price: number;
}

export interface Invoice {
  _id?: string;
  invoiceNumber: string;
  date: string;
  shopName: string;
  shopAddress: string;
  shopPhone: string;
  shopEmail: string;
  paymentUPI: string;
  paymentInfo: string;
  paymentQRCode: string;
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  items: InvoiceItem[];
  taxRate: number;
  notes: string;
  subtotal?: number;
  total?: number;
  createdAt?: string;
}

export interface MasterItem {
  _id: string;
  name: string;
  price: number;
  description?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
}
