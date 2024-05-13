import React, { useCallback } from 'react';
import cs from 'classnames';
import { useDispatch } from 'react-redux';
import { FontIcon } from 'office-ui-fabric-react/lib/Icon';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { useWalletSelectorSate } from '@views/workspace/workspaceDetail/header/walletSelector/hooks/useWalletSelectorSate';
import { WalletSelectorActionTypes } from '@store/actions';
import { Scroll } from '@modules/common/components';
import {
  transformAddress,
  transformBalance
} from '@modules/editor/utils/wallet';
import { thirdFontStyle, accountStyles } from '../style';
import style from '../style.less';

interface AccountListProps {
  toggleView: () => void;
}

export default function AccountList(props: AccountListProps) {
  const { toggleView } = props;
  const dispatch = useDispatch();
  const {
    walletInstData: { currentAccounts, currentAccount, ...rest }
  } = useWalletSelectorSate();

  const handleAccountChange = useCallback(
    (account) => {
      dispatch({
        type: WalletSelectorActionTypes.SET_WALLET_DATA,
        data: {
          ...rest,
          currentAccounts,
          currentAccount: account
        }
      });
      toggleView();
    },
    [currentAccounts, dispatch, toggleView, rest]
  );

  return (
    <div className={style.accountList}>
      {currentAccounts.length && currentAccounts.length > 0 && (
        <div className={style.listWrapper}>
          <Scroll>
            <>
              {currentAccounts.map((item, index) => (
                <Stack key={item.address} styles={accountStyles}>
                  <div
                    onClick={() => handleAccountChange(item)}
                    className={cs([style.accountItem, 'account'])}
                  >
                    <div
                      className={style.dot}
                      style={{
                        backgroundColor:
                          currentAccount?.address === item.address
                            ? '#fdfdfd'
                            : 'transparent'
                      }}
                    />
                    <div className={style.accountInfo}>
                      <FontIcon iconName="Contact" />
                      <div className={style.content}>
                        <div className={style.top}>
                          <div className={style.name}>
                            {`Account ${index + 1}`}
                          </div>
                          <div style={thirdFontStyle} className={style.balance}>
                            {transformBalance((item.balance / 1e18).toString())}
                          </div>
                        </div>
                        <div className={style.bottom}>
                          <div style={thirdFontStyle} className={style.address}>
                            {transformAddress(item.address)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Stack>
              ))}
            </>
          </Scroll>
        </div>
      )}
    </div>
  );
}
