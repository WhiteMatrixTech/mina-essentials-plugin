/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Emitter } from '@white-matrix/event-emitter';


export enum WalletServiceEventType {
  WALLET_CONNECTED = 'WALLET_CONNECTED',
  CHAIN_CHANGE = 'CHAIN_CHANGE'
}

export interface WalletServiceEvent {
  type: WalletServiceEventType;
  data?: unknown;
}

export type NetworkType = 'mainnet' | 'testnet' | 'devnet';


export class WalletService {
  network: any;
  account: { address: string } | null;
  initialized = false;

  private readonly _walletServiceEvent = new Emitter<WalletServiceEvent>();
  readonly onWalletServiceEmit = this._walletServiceEvent.event;

  constructor() {
    this.network = 'devnet';
    this.account = null;
  }

  connect = async () => {
    if (typeof window.mina === 'undefined') {
      throw new Error('Mina is not installed');
    }

    try {
      const account = await window.mina.requestAccounts()
      const network = await window.mina.requestNetwork()
      this.account = {
        address: account[0],
      }
      this.network = network.chainId

    } catch (e) {
      console.error(e)
    }
    this._walletServiceEvent.fire({
      type: WalletServiceEventType.WALLET_CONNECTED,
    });
  };

  declare = async () => {
    console.log('declare')
  }

  deploy = async () => {
    console.log('deploy')
  }

  call = async (contractAddress: string, functionName: string, calldata: any[]) => {
  }

  execute = async (contractAddress: string, functionName: string, calldata: any[]) => {

  }
}

const walletService = new WalletService();

export { walletService };
