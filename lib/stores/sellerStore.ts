import { create } from 'zustand';
import { Seller, SellerFormData } from '@/types';
import { sellersService, SellerQueryParams } from '@/lib/api/sellers.service';

interface SellerState {
  sellers: Seller[];
  selectedSeller: Seller | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface SellerActions {
  fetchSellers: (params?: SellerQueryParams) => Promise<void>;
  fetchSellerById: (id: string) => Promise<void>;
  createSeller: (data: SellerFormData) => Promise<Seller>;
  updateSeller: (id: string, data: Partial<SellerFormData>) => Promise<Seller>;
  deleteSeller: (id: string) => Promise<void>;
  searchSellers: (query: string) => Promise<void>;
  setSelectedSeller: (seller: Seller | null) => void;
  clearError: () => void;
}

type SellerStore = SellerState & SellerActions;

const initialState: SellerState = {
  sellers: [],
  selectedSeller: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
};

export const useSellerStore = create<SellerStore>((set, get) => ({
  ...initialState,

  fetchSellers: async (params?: SellerQueryParams) => {
    set({ isLoading: true, error: null });
    try {
      const response = await sellersService.getAll(params);
      set({
        sellers: response.data,
        pagination: response.meta || initialState.pagination,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch sellers',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchSellerById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await sellersService.getById(id);
      set({
        selectedSeller: response.data,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch seller',
        isLoading: false,
      });
      throw error;
    }
  },

  createSeller: async (data: SellerFormData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await sellersService.create(data);
      const newSeller = response.data;

      set((state) => ({
        sellers: [newSeller, ...state.sellers],
        isLoading: false,
      }));

      return newSeller;
    } catch (error: any) {
      set({
        error: error.message || 'Failed to create seller',
        isLoading: false,
      });
      throw error;
    }
  },

  updateSeller: async (id: string, data: Partial<SellerFormData>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await sellersService.update(id, data);
      const updatedSeller = response.data;

      set((state) => ({
        sellers: state.sellers.map((seller) =>
          seller.id === id ? updatedSeller : seller
        ),
        selectedSeller:
          state.selectedSeller?.id === id ? updatedSeller : state.selectedSeller,
        isLoading: false,
      }));

      return updatedSeller;
    } catch (error: any) {
      set({
        error: error.message || 'Failed to update seller',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteSeller: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await sellersService.delete(id);

      set((state) => ({
        sellers: state.sellers.filter((seller) => seller.id !== id),
        selectedSeller:
          state.selectedSeller?.id === id ? null : state.selectedSeller,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || 'Failed to delete seller',
        isLoading: false,
      });
      throw error;
    }
  },

  searchSellers: async (query: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await sellersService.search(query);
      set({
        sellers: response.data,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to search sellers',
        isLoading: false,
      });
      throw error;
    }
  },

  setSelectedSeller: (seller: Seller | null) => {
    set({ selectedSeller: seller });
  },

  clearError: () => {
    set({ error: null });
  },
}));
