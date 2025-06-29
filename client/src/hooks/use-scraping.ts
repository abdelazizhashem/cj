import { create } from 'zustand';

interface ScrapingStore {
  searchQuery: string | null;
  sessionId: number | null;
  isSearching: boolean;
  setSearchQuery: (query: string) => void;
  setSessionId: (id: number) => void;
  setIsSearching: (searching: boolean) => void;
  reset: () => void;
}

export const useSearchData = create<ScrapingStore>((set) => ({
  searchQuery: null,
  sessionId: null,
  isSearching: false,
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSessionId: (id) => set({ sessionId: id, isSearching: true }),
  setIsSearching: (searching) => set({ isSearching: searching }),
  reset: () => set({ searchQuery: null, sessionId: null, isSearching: false }),
}));
