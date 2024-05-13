import { walletService } from '../WalletService';

export class AuroWallet {
  walletId = 'AuroWallet';

  wallet: null = null;

  static instance: AuroWallet | null;

  static getInstance(): AuroWallet {
    if (!this.instance || this.instance instanceof this === false) {
      this.instance = new this();
    }
    return this.instance;
  }

  init() {
    return new Promise<void>((resolve, reject) => {
      walletService
        .connect()
        .then(() => {
          resolve();
        })
        .catch((e: Error) => {
          reject(e);
        });
    });
  }

  fetchNetwork = async (): Promise<string> => {
    return walletService.network || ''
  };

  fetchAccount = async (): Promise<string> => {
    return walletService.account?.address || ''
  };

  getAccountBalance = async (address: string) => {
    return {
      address,
      balance: 0
    };
  };
}

export const AuroWalletInst: AuroWallet = AuroWallet.getInstance();
