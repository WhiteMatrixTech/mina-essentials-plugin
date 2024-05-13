import { useEffect, useState } from 'react';
import { walletService } from '../wallets/WalletService';

export function useSuiWallet() {
  const [network, setNetwork] = useState('');
  const [account, setAccount] = useState();
  const [balance, setBalance] = useState(0);

  const getAccount = () => {
    const wallet = walletService.wallet;
  };

  return {
    network,
    account,
    balance
  };
}
