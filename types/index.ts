// User types
export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: 'ADMIN' | 'MANAGER' | 'OPERATOR' | 'ACCOUNTANT' | 'VIEWER';
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
    user: User;
  };
  message: string;
}

// Buyer types
export interface Buyer {
  id: string;
  name: string;
  legalType: 'INDIVIDUAL' | 'LEGAL_ENTITY';
  prefix?: string;
  contactPerson: string;
  email: string;
  phone: string;
  address?: string;
  country: string;
  taxId: string;
  createdAt: string;
  updatedAt: string;
}

// Bank types
export interface Bank {
  id: string;
  name: string;
  accountNumber?: string; // Legacy field, keep for backward compatibility
  accountNumberGEL?: string;
  accountNumberUSD?: string;
  accountNumberEUR?: string;
  address?: string;
  swift?: string;
  intermediaryBankName?: string;
  intermediaryBankSwift?: string;
  isDefault?: boolean;
  sellerId?: string;
  createdAt?: string;
  deletedAt?: string | null;
  legacyId?: string | null;
}

// Seller types
export interface Seller {
  id: string;
  name: string;
  legalType: 'INDIVIDUAL' | 'LEGAL_ENTITY';
  prefix?: string;
  contactPerson: string;
  email: string;
  phone: string;
  address?: string;
  country: string;
  taxId: string;
  logo?: string;
  stamp?: string;
  banks?: Bank[];
  createdAt: string;
  updatedAt: string;
}

// Passenger types
export interface Passenger {
  id?: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
}

// Product types
export interface Product {
  id?: string;
  description: string;
  direction?: string;
  departureDate?: string;
  arrivalDate?: string;
  quantity: number;
  price: number;
  total: number;
}

// Invoice types
export type InvoiceStatus = 'DRAFT' | 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELED';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string;
  currency: string;
  currencyTo?: string;
  departureDate?: string;
  showLogo: boolean;
  showStamp: boolean;
  status: InvoiceStatus;
  buyer: Buyer;
  seller: Seller;
  passengers?: Passenger[];
  products: Product[];
  subtotal: number;
  discountType?: 'PERCENTAGE' | 'FIXED' | 'NONE';
  discountValue?: number;
  totalAfterDiscount: number;
  conversionCurrency?: string;
  exchangeRate?: number;
  grandTotal: number;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
  canceledAt?: string;
  cancelReason?: string;
}

// Dashboard types
export interface DashboardStats {
  totalInvoices: number;
  totalCanceledInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  canceledInvoices: number;
  totalRevenue: number;
  revenueUSD: string | number;
  revenueGEL: string | number;
  revenueEUR: string | number;
  revenueOverTime: Array<{ month: string; revenue: number }>;
  statusDistribution: Array<{ status: string; count: number; percentage: number }>;
  recentInvoices: Invoice[];
  recentActivities: Activity[];
}

export interface Activity {
  id: string;
  user: string;
  action: string;
  resource: string;
  timestamp: string;
}

export interface TopBuyer {
  name: string;
  invoiceCount: number;
  revenueByCurrency: {
    USD?: number;
    GEL?: number;
    EUR?: number;
  };
}

export interface EmployeeInvoiceStats {
  fullName: string;
  invoiceCount: number;
  avatar?: string;
}

export interface BankCurrencyRate {
  buy?: number;
  sell?: number;
  dgtlBuy?: number;
  dgtlSell?: number;
  currentRate?: number;
  officialCourse?: number;
  rate?: number;
  quantity?: number;
  ratePerUnit?: number;
  diff?: number;
  name?: string;
}

export interface BankRates {
  USD?: BankCurrencyRate;
  EUR?: BankCurrencyRate;
}

export interface CurrencyRates {
  bog?: BankRates;
  tbc?: BankRates;
  pcb?: BankRates;
  nbg?: BankRates;
}

// Sales Report types
export interface SalesReport {
  id: string;
  issueDate: Date | string;
  productName: string | null;
  ticketNumber: string | null;
  pnr: string | null;
  airlineCompany: string | null;
  passenger: string | null;
  destination: string | null;
  departureArrivalDate: Date | string | null;
  fare: number | null;
  net: number | null;
  serviceFee: number | null;
  totalAmount: number | null;
  invoiceNumber: string | null;
  provider: string | null;
  buyer: string | null;
  comment: string | null;
  createdBy: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  deletedAt: Date | string | null;
  user?: {
    id: string;
    fullName: string;
    email: string;
  };
}

export interface SalesReportFilters {
  page?: number;
  limit?: number;
  invoiceNumber?: string;
  passenger?: string;
  buyer?: string;
  provider?: string;
  productName?: string;
  issueDateFrom?: string; // ISO date string
  issueDateTo?: string;   // ISO date string
  search?: string;
}

export interface SalesReportFormData {
  issueDate: Date | string;
  productName?: string;
  ticketNumber?: string;
  pnr?: string;
  airlineCompany?: string;
  passenger?: string;
  destination?: string;
  departureArrivalDate?: Date | string;
  fare?: number;
  net?: number;
  serviceFee?: number;
  totalAmount?: number;
  invoiceNumber?: string;
  provider?: string;
  buyer?: string;
  comment?: string;
}

// Settings types
export interface Settings {
  companyName: string;
  companyLogo?: string;
  defaultCurrency: string;
  dateFormat: string;
  timezone: string;
  invoicePrefix: string;
  startingNumber: number;
  autoIncrement: boolean;
  smtpHost?: string;
  smtpPort?: number;
  smtpUsername?: string;
  smtpPassword?: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message: string;
  // Pagination can be in different structures depending on endpoint
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  success: false;
  message: string;
  statusCode: number;
  errors?: Array<{ field: string; message: string }>;
}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export interface InvoiceFormData {
  invoiceDate: Date;
  invoiceNumber: string;
  showLogo: boolean;
  showStamp: boolean;
  currency: string;
  buyerId: string;
  sellerId: string;
  passengers: Passenger[];
  products: Product[];
  discountType: 'NONE' | 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  conversionCurrency?: string;
  exchangeRate?: number;
}

export interface UserFormData {
  fullName: string;
  email: string;
  phone?: string;
  role: 'ADMIN' | 'MANAGER' | 'OPERATOR' | 'ACCOUNTANT' | 'VIEWER';
  password?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface BuyerFormData {
  name: string;
  legalType: 'INDIVIDUAL' | 'LEGAL_ENTITY';
  prefix?: string;
  contactPerson: string;
  email: string;
  phone: string;
  address?: string;
  country: string;
  taxId: string;
}

export interface SellerFormData {
  name: string;
  legalType: 'INDIVIDUAL' | 'LEGAL_ENTITY';
  prefix?: string;
  contactPerson: string;
  email: string;
  phone: string;
  address?: string;
  country: string;
  taxId: string;
  logo?: string | File;
  stamp?: string | File;
  banks: Array<{
    id?: string;
    name: string;
    accountNumber?: string; // Legacy field, keep for backward compatibility
    accountNumberGEL?: string;
    accountNumberUSD?: string;
    accountNumberEUR?: string;
    address?: string;
    swift?: string;
    intermediaryBankName?: string;
    intermediaryBankSwift?: string;
    isDefault?: boolean;
  }>;
}
