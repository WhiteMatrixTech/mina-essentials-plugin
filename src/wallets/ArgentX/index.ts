import { WalletName, walletService } from '../WalletService';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));


export class ArgentXWallet {
  walletId = 'ArgentXWallet';

  wallet: null = null;

  static instance: ArgentXWallet | null;

  static getInstance(): ArgentXWallet {
    if (!this.instance || this.instance instanceof this === false) {
      this.instance = new this();
    }
    return this.instance;
  }

  init() {
    return new Promise<void>((resolve, reject) => {
      walletService.connect(WalletName.ArgentX)
        .then(() => {
          wait(100).then(() => resolve())
        })
        .catch((e: Error) => {
          reject(e)
        })
    });
  }

  fetchNetwork = async (): Promise<string> => {
    return walletService.account?.getChainId() || ''
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

export const ArgentXWalletInst: ArgentXWallet = ArgentXWallet.getInstance();
