import { SyncState, TransferItem } from '../types';

const DEFAULT_STATE: SyncState = {
  currentAddress: null,
  recentAddresses: [],
  transferHistory: [],
  preferences: {
    autoSync: true,
    pollInterval: 3000,
  },
};

export class SyncStorage {
  private static STORAGE_KEY = 'quickbridge-sync-state';

  static async get(): Promise<SyncState> {
    try {
      const result = await chrome.storage.local.get(this.STORAGE_KEY);
      return result[this.STORAGE_KEY] || DEFAULT_STATE;
    } catch (error) {
      console.error('Failed to get sync state:', error);
      return DEFAULT_STATE;
    }
  }

  static async set(state: Partial<SyncState>): Promise<void> {
    try {
      const current = await this.get();
      const updated = { ...current, ...state };
      await chrome.storage.local.set({ [this.STORAGE_KEY]: updated });
    } catch (error) {
      console.error('Failed to set sync state:', error);
    }
  }

  static async setCurrentAddress(address: string | null): Promise<void> {
    const state = await this.get();

    if (address && !state.recentAddresses.includes(address)) {
      state.recentAddresses = [address, ...state.recentAddresses].slice(0, 10);
    }

    await this.set({
      currentAddress: address,
      recentAddresses: state.recentAddresses,
    });
  }

  static async addToHistory(item: TransferItem): Promise<void> {
    const state = await this.get();
    const history = [item, ...state.transferHistory].slice(0, 50);

    await this.set({ transferHistory: history });
  }

  static async clearHistory(): Promise<void> {
    await this.set({ transferHistory: [] });
  }

  static async updatePreferences(preferences: Partial<SyncState['preferences']>): Promise<void> {
    const state = await this.get();
    await this.set({
      preferences: { ...state.preferences, ...preferences },
    });
  }

  static async clear(): Promise<void> {
    try {
      await chrome.storage.local.remove(this.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear sync state:', error);
    }
  }

  static onChange(callback: (state: SyncState) => void): void {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'local' && changes[this.STORAGE_KEY]) {
        callback(changes[this.STORAGE_KEY].newValue || DEFAULT_STATE);
      }
    });
  }
}
