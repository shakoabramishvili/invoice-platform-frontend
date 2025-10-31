import { create } from 'zustand';
import { Buyer, BuyerFormData } from '@/types';
import { buyersService, BuyerQueryParams } from '@/lib/api/buyers.service';

interface BuyerState {
  buyers: Buyer[];
  selectedBuyer: Buyer | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface BuyerActions {
  fetchBuyers: (params?: BuyerQueryParams) => Promise<void>;
  fetchBuyerById: (id: string) => Promise<void>;
  createBuyer: (data: BuyerFormData) => Promise<Buyer>;
  updateBuyer: (id: string, data: Partial<BuyerFormData>) => Promise<Buyer>;
  deleteBuyer: (id: string) => Promise<void>;
  searchBuyers: (query: string) => Promise<void>;
  setSelectedBuyer: (buyer: Buyer | null) => void;
  clearError: () => void;
}

type BuyerStore = BuyerState & BuyerActions;

const initialState: BuyerState = {
  buyers: [],
  selectedBuyer: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
};

export const useBuyerStore = create<BuyerStore>((set, get) => ({
  ...initialState,

  fetchBuyers: async (params?: BuyerQueryParams) => {
    set({ isLoading: true, error: null });
    try {
      const response = await buyersService.getAll(params);
      set({
        buyers: response.data,
        pagination: response.meta || initialState.pagination,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch buyers',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchBuyerById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await buyersService.getById(id);
      set({
        selectedBuyer: response.data,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch buyer',
        isLoading: false,
      });
      throw error;
    }
  },

  createBuyer: async (data: BuyerFormData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await buyersService.create(data);
      const newBuyer = response.data;

      set((state) => ({
        buyers: [newBuyer, ...state.buyers],
        isLoading: false,
      }));

      return newBuyer;
    } catch (error: any) {
      set({
        error: error.message || 'Failed to create buyer',
        isLoading: false,
      });
      throw error;
    }
  },

  updateBuyer: async (id: string, data: Partial<BuyerFormData>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await buyersService.update(id, data);
      const updatedBuyer = response.data;

      set((state) => ({
        buyers: state.buyers.map((buyer) =>
          buyer.id === id ? updatedBuyer : buyer
        ),
        selectedBuyer:
          state.selectedBuyer?.id === id ? updatedBuyer : state.selectedBuyer,
        isLoading: false,
      }));

      return updatedBuyer;
    } catch (error: any) {
      set({
        error: error.message || 'Failed to update buyer',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteBuyer: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await buyersService.delete(id);

      set((state) => ({
        buyers: state.buyers.filter((buyer) => buyer.id !== id),
        selectedBuyer:
          state.selectedBuyer?.id === id ? null : state.selectedBuyer,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || 'Failed to delete buyer',
        isLoading: false,
      });
      throw error;
    }
  },

  searchBuyers: async (query: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await buyersService.search(query);
      set({
        buyers: response.data,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to search buyers',
        isLoading: false,
      });
      throw error;
    }
  },

  setSelectedBuyer: (buyer: Buyer | null) => {
    set({ selectedBuyer: buyer });
  },

  clearError: () => {
    set({ error: null });
  },
}));
