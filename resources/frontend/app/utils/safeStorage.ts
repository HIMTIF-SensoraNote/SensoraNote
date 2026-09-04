/**
 * Safe localStorage and sessionStorage wrapper.
 * 
 * In Safari (especially Private Browsing mode), iOS WKWebView, or browsers
 * with strict third-party cookie/storage restrictions:
 * - `localStorage.getItem`, `setItem`, `removeItem`
 * - `sessionStorage.getItem`, `setItem`, `removeItem`
 * can throw `SecurityError: The operation is insecure` or `QuotaExceededError`.
 * 
 * This wrapper catches all exceptions and transparently falls back to an in-memory store,
 * ensuring the application never crashes during storage operations.
 */

const memoryStore: Record<string, string> = {};

export const safeLocalStorage = {
  getItem(key: string): string | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch (e) {
      // Safari private browsing or storage disabled
    }
    return Object.prototype.hasOwnProperty.call(memoryStore, `ls_${key}`)
      ? memoryStore[`ls_${key}`]
      : null;
  },

  setItem(key: string, value: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
        return;
      }
    } catch (e) {
      // Safari private browsing or quota exceeded
    }
    memoryStore[`ls_${key}`] = String(value);
  },

  removeItem(key: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (e) {}
    delete memoryStore[`ls_${key}`];
  },

  clear(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.clear();
      }
    } catch (e) {}
    for (const k of Object.keys(memoryStore)) {
      if (k.startsWith('ls_')) delete memoryStore[k];
    }
  }
};

export const safeSessionStorage = {
  getItem(key: string): string | null {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        return window.sessionStorage.getItem(key);
      }
    } catch (e) {
      // Safari private browsing or storage disabled
    }
    return Object.prototype.hasOwnProperty.call(memoryStore, `ss_${key}`)
      ? memoryStore[`ss_${key}`]
      : null;
  },

  setItem(key: string, value: string): void {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.setItem(key, value);
        return;
      }
    } catch (e) {
      // Safari private browsing or quota exceeded
    }
    memoryStore[`ss_${key}`] = String(value);
  },

  removeItem(key: string): void {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.removeItem(key);
      }
    } catch (e) {}
    delete memoryStore[`ss_${key}`];
  },

  clear(): void {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.clear();
      }
    } catch (e) {}
    for (const k of Object.keys(memoryStore)) {
      if (k.startsWith('ss_')) delete memoryStore[k];
    }
  }
};
