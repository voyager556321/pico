/**
 * Desktop-only stub. Avoids loading @solana/kit via mobile wallet adapter
 * (breaks Next/webpack: setTransactionMessageComputeUnitLimit).
 */
export const SolanaMobileWalletAdapterWalletName = "Solana Mobile Wallet Adapter";

export class SolanaMobileWalletAdapter {
  name = SolanaMobileWalletAdapterWalletName;
  url = "";
  icon = "";
  readyState = "Unsupported";
  publicKey = null;
  connecting = false;
  connected = false;
  supportedTransactionVersions = null;

  constructor(_config) {
    // no-op stub for desktop Next.js demo
  }

  async connect() {
    throw new Error("Mobile wallet adapter is disabled in Pico web demo");
  }
  async autoConnect() {
    throw new Error("Mobile wallet adapter is disabled in Pico web demo");
  }
  async disconnect() {}
  async sendTransaction() {
    throw new Error("Mobile wallet adapter is disabled in Pico web demo");
  }
  async signTransaction() {
    throw new Error("Mobile wallet adapter is disabled in Pico web demo");
  }
  async signAllTransactions() {
    throw new Error("Mobile wallet adapter is disabled in Pico web demo");
  }
  async signMessage() {
    throw new Error("Mobile wallet adapter is disabled in Pico web demo");
  }
  on() {
    return this;
  }
  off() {
    return this;
  }
  once() {
    return this;
  }
  emit() {
    return false;
  }
  removeListener() {
    return this;
  }
  removeAllListeners() {
    return this;
  }
  addListener() {
    return this;
  }
  listenerCount() {
    return 0;
  }
  listeners() {
    return [];
  }
  eventNames() {
    return [];
  }
}

export function createDefaultAddressSelector() {
  return {
    select: async (addresses) => addresses[0],
  };
}

export function createDefaultAuthorizationResultCache() {
  return {
    clear: async () => {},
    get: async () => undefined,
    set: async () => {},
  };
}

export function createDefaultWalletNotFoundHandler() {
  return async () => {};
}
