import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useIntl } from 'react-intl';
import cn from 'classnames';
import { FontIcon, Stack } from 'office-ui-fabric-react';
import { ChainIdeClipboard } from '@modules/common/components/clipboard';
import { thirdFontStyle } from '../style';
import { walletService } from '../../../wallets/WalletService';
import style from '../style.less';
import { transformAddress } from '@modules/extensions/chainSupport/astar/utils';

export default function AccountDetail() {
  const [balance, setBalance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const { formatMessage } = useIntl();

  const balanceShow = useMemo(() => {
    if (!walletService.account) {
      return formatMessage({ id: 'XDC_WALLET_LOADING' });
    }
    return (balance / 1e9).toString();
  }, [balance, formatMessage]);

  useEffect(() => {
    if (walletService.account) {
      walletService.getBalance(walletService.account.address).then((res) => {
        setBalance(parseInt(res.totalBalance));
      });
    }
    const dispose = walletService.onWalletServiceEmit(() => {
      if (walletService.account) {
        walletService.getBalance(walletService.account.address).then((res) => {
          setBalance(parseInt(res.totalBalance));
        });
      }
    });

    return dispose.dispose;
  }, []);

  const refreshBalance = useCallback(async () => {
    setRefreshing(true);
    if (walletService.account) {
      walletService.getBalance(walletService.account.address).then((res) => {
        setBalance(parseInt(res.totalBalance));
        setRefreshing(false);
      });
    }
  }, []);

  if (!walletService.account) {
    return (
      <Stack
        className={style.accountDetail}
        tokens={{ childrenGap: 15 }}
        styles={{
          root: {
            padding: '12px 16px',
            marginBottom: '4px'
          }
        }}
      >
        {formatMessage({ id: 'XDC_WALLET_LOADING' })}
      </Stack>
    );
  }

  return (
    <Stack
      className={style.accountDetail}
      tokens={{ childrenGap: 15 }}
      styles={{
        root: {
          padding: '12px 16px'
        }
      }}
    >
      <Stack.Item className={style.center}>
        {formatMessage({ id: 'XDC_WALLET_ADDRESS' })}
      </Stack.Item>
      <Stack.Item style={thirdFontStyle} className={style.center}>
        <span className={style.accountAddress}>
          {transformAddress(walletService.account?.address || '')}
        </span>
        <ChainIdeClipboard text={walletService.account?.address}>
          <FontIcon iconName="Copy" />
        </ChainIdeClipboard>
      </Stack.Item>
      <Stack.Item className={style.accountBalance}>
        <div className={style.balance}>{balanceShow}</div>
        <span>Sui</span>
        <FontIcon
          iconName="Refresh"
          className={cn(style.refresh, {
            [style.loadingIcon]: refreshing
          })}
          onClick={refreshBalance}
        />
      </Stack.Item>
      <Stack
        tokens={{ childrenGap: 12 }}
        styles={{ root: { padding: '0px 15px' } }}
      ></Stack>
    </Stack>
  );
}
