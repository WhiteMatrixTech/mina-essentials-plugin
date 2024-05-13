import cn from 'classnames';
import { FontIcon } from 'office-ui-fabric-react/lib/Icon';
import { mergeStyles } from 'office-ui-fabric-react/lib/Styling';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';

import { useWalletSelectorSate } from '@views/workspace/workspaceDetail/header/walletSelector/hooks/useWalletSelectorSate';

import { transformAddress } from '../../astar/utils';
import { walletService } from '../wallets/WalletService';
import style from './style.less';

const iconClass = mergeStyles({
  fontSize: 14,
  height: 14,
  width: 14,
  margin: '0 4px'
});

export function BottomWallet() {
  const { formatMessage } = useIntl();
  const [showWallet, setShowWallet] = useState(false);
  const [balance, setBalance] = useState(0);
  const {
    walletInstData: { isBrowserWalletExist }
  } = useWalletSelectorSate();

  const balanceShow = useMemo(() => {
    if (!walletService.account) {
      return formatMessage({ id: 'XDC_WALLET_LOADING' });
    }
    return (balance / 1e9).toString();
  }, [balance, formatMessage]);

  const [warnMesVisible, setWarnMesVisible] = useState(false);

  const toggleWalletVisible = useCallback(() => {
    setShowWallet(!showWallet);
    if (warnMesVisible) {
      setWarnMesVisible(false);
    }
  }, [showWallet, warnMesVisible]);

  // useEffect(() => {
  //   const dispose = walletService.onWalletServiceEmit(() => {
  //     if (walletService.account) {
  //       walletService.getBalance(walletService.account.address).then((res) => {
  //         setBalance(parseInt(res.totalBalance));
  //       });
  //     }
  //   });

  //   return dispose.dispose;
  // }, []);

  if (isBrowserWalletExist) {
    return (
      <div className={style.bottomWallet}>
        <div className={cn(style.mesContent, style.warning)}>
          <FontIcon iconName="Warning" className={iconClass} />
          <div className={style.mesValue}>{isBrowserWalletExist}</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        role="button"
        className={style.bottomWallet}
        // onClick={toggleWalletVisible}
      >
        <div className={style.mesContent}>
          <FontIcon iconName="Globe" className={iconClass} />
          <div className={style.mesValue}>{walletService.network}</div>
        </div>
        <div className={style.mesContent}>
          <FontIcon iconName="BranchShelveset" className={iconClass} />
          <div className={style.mesValue}>
            {walletService.account
              ? transformAddress(walletService.account?.address)
              : formatMessage({ id: 'XDC_WALLET_LOADING' })}
          </div>
        </div>

        <div className={style.mesContent}></div>
      </div>
      {/* {showWallet && <WalletLayer toggleWalletVisible={toggleWalletVisible} />} */}
    </>
  );
}
