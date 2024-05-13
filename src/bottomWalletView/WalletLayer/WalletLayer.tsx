import React, { useCallback, useState } from 'react';
import { Stack, IComboBoxOption } from 'office-ui-fabric-react';
import { FontIcon } from 'office-ui-fabric-react/lib/Icon';
import { FluentDropdown as Dropdown } from '@modules/common/components';
import { chainIdNetworkNameMap } from '@modules/common/const/chains';
import { useWalletSelectorSate } from '@views/workspace/workspaceDetail/header/walletSelector/hooks/useWalletSelectorSate';
import AccountDetail from './WalletContent/AccountDetail';
import AccountList from './WalletContent//AccountList';
import { walletService } from '../../wallets/WalletService';
import {
  wrapperStyle,
  leftStyles,
  rightStyles,
  headerStyle,
  dropDownStyles,
  avatarIconClass,
  closeIconClass
} from './style';
import style from './style.less';

const options: IComboBoxOption[] = [
  {
    key: 'devnet',
    text: 'Sui Devnet'
  },
  {
    key: 'testnet',
    text: 'Sui Testnet'
  },
  {
    key: 'mainnet',
    text: 'Sui Mainnet'
  },
  {
    key: 'Unconnected',
    text: 'Unconnected'
  }
];

export interface IProps {
  toggleWalletVisible: () => void;
  defaultOpenSwitch?: boolean;
}

export function WalletLayer(props: IProps) {
  const {
    walletInstData: { currentChainID }
  } = useWalletSelectorSate();

  const { toggleWalletVisible, defaultOpenSwitch } = props;
  const closeWallet = useCallback(() => {
    toggleWalletVisible();
  }, [toggleWalletVisible]);

  const [currentView, setCurrentView] = useState('detail');
  const toggleView = useCallback(() => {}, [currentView]);

  return (
    <div style={wrapperStyle} className={style.walletWrapper}>
      <Stack horizontal={true} styles={headerStyle}>
        <Stack.Item grow={true} styles={leftStyles}>
          <Dropdown
            title={walletService.network}
            label=""
            disabled={true}
            options={options}
            styles={dropDownStyles}
            selectedKey={walletService.network || 'Unconnected'}
          />
        </Stack.Item>
        <Stack.Item grow={true} styles={rightStyles}>
          <FontIcon
            iconName="Contact"
            className={avatarIconClass}
            onClick={toggleView}
          />
        </Stack.Item>
        <Stack.Item grow={true} styles={rightStyles}>
          <FontIcon
            iconName="ChevronDown"
            className={closeIconClass}
            onClick={closeWallet}
          />
        </Stack.Item>
      </Stack>
      <div className={style.walletContent}>
        <AccountDetail defaultOpenSwitch={defaultOpenSwitch} />
      </div>
    </div>
  );
}
