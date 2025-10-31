import { create } from 'zustand';
import { Invoice, InvoiceFormData } from '@/types';
import { invoicesService, InvoiceQueryParams } from '@/lib/api/invoices.service';

interface InvoiceState {
  invoices: Invoice[];
  selectedInvoice: Invoice | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface InvoiceActions {
  fetchInvoices: (params?: InvoiceQueryParams) => Promise<void>;
  fetchInvoiceById: (id: string) => Promise<void>;
  createInvoice: (data: InvoiceFormData) => Promise<Invoice>;
  updateInvoice: (id: string, data: Partial<InvoiceFormData>) => Promise<Invoice>;
  deleteInvoice: (id: string) => Promise<void>;
  cancelInvoice: (id: string, reason: string) => Promise<void>;
  updateInvoiceStatus: (id: string, status: string) => Promise<void>;
  duplicateInvoice: (id: string) => Promise<Invoice>;
  setSelectedInvoice: (invoice: Invoice | null) => void;
  clearError: () => void;
}

type InvoiceStore = InvoiceState & InvoiceActions;

const initialState: InvoiceState = {
  invoices: [],
  selectedInvoice: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
};

export const useInvoiceStore = create<InvoiceStore>((set, get) => ({
  ...initialState,

  fetchInvoices: async (params?: InvoiceQueryParams) => {
    set({ isLoading: true, error: null });
    try {
      const response = await invoicesService.getAll(params);
      set({
        invoices: response.data,
        pagination: response.meta || initialState.pagination,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch invoices',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchInvoiceById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await invoicesService.getById(id);
      set({
        selectedInvoice: response.data,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch invoice',
        isLoading: false,
      });
      throw error;
    }
  },

  createInvoice: async (data: InvoiceFormData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await invoicesService.create(data);
      const newInvoice = response.data;

      set((state) => ({
        invoices: [newInvoice, ...state.invoices],
        isLoading: false,
      }));

      return newInvoice;
    } catch (error: any) {
      set({
        error: error.message || 'Failed to create invoice',
        isLoading: false,
      });
      throw error;
    }
  },

  updateInvoice: async (id: string, data: Partial<InvoiceFormData>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await invoicesService.update(id, data);
      const updatedInvoice = response.data;

      set((state) => ({
        invoices: state.invoices.map((inv) =>
          inv.id === id ? updatedInvoice : inv
        ),
        selectedInvoice:
          state.selectedInvoice?.id === id ? updatedInvoice : state.selectedInvoice,
        isLoading: false,
      }));

      return updatedInvoice;
    } catch (error: any) {
      set({
        error: error.message || 'Failed to update invoice',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteInvoice: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await invoicesService.delete(id);

      set((state) => ({
        invoices: state.invoices.filter((inv) => inv.id !== id),
        selectedInvoice:
          state.selectedInvoice?.id === id ? null : state.selectedInvoice,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || 'Failed to delete invoice',
        isLoading: false,
      });
      throw error;
    }
  },

  cancelInvoice: async (id: string, reason: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await invoicesService.cancel(id, reason);
      const canceledInvoice = response.data;

      set((state) => ({
        invoices: state.invoices.map((inv) =>
          inv.id === id ? canceledInvoice : inv
        ),
        selectedInvoice:
          state.selectedInvoice?.id === id ? canceledInvoice : state.selectedInvoice,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || 'Failed to cancel invoice',
        isLoading: false,
      });
      throw error;
    }
  },

  updateInvoiceStatus: async (id: string, status: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await invoicesService.updateStatus(id, status);
      const updatedInvoice = response.data;

      set((state) => ({
        invoices: state.invoices.map((inv) =>
          inv.id === id ? updatedInvoice : inv
        ),
        selectedInvoice:
          state.selectedInvoice?.id === id ? updatedInvoice : state.selectedInvoice,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || 'Failed to update invoice status',
        isLoading: false,
      });
      throw error;
    }
  },

  duplicateInvoice: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await invoicesService.duplicate(id);
      const duplicatedInvoice = response.data;

      set((state) => ({
        invoices: [duplicatedInvoice, ...state.invoices],
        isLoading: false,
      }));

      return duplicatedInvoice;
    } catch (error: any) {
      set({
        error: error.message || 'Failed to duplicate invoice',
        isLoading: false,
      });
      throw error;
    }
  },

  setSelectedInvoice: (invoice: Invoice | null) => {
    set({ selectedInvoice: invoice });
  },

  clearError: () => {
    set({ error: null });
  },
}));
