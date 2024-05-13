/* eslint-disable @typescript-eslint/no-unused-vars */
import icon from '@assets/static/img/pluginIcon/active/suiWallet-logo.svg';
import inactiveIcon from '@assets/static/img/pluginIcon/inactive/suiWallet-logo.svg';

import chainIDE from '@modules/extensions/client/chainIdeProxyImpl';
import { Plugin, PluginContext, PluginType } from '@modules/extensions/types';

import { BottomWallet } from './bottomWalletView';
import { AuroWalletInst } from './wallets/Auro';

export const pluginConfig: Plugin = {
  activate(ctx: PluginContext) {
    const registerWallet = chainIDE.registerWallet({
      walletId: AuroWalletInst.walletId,
      init: AuroWalletInst.init,
      fetchNetWork: AuroWalletInst.fetchNetwork,
      fetchAccount: AuroWalletInst.fetchAccount,
      getAccountBalance: AuroWalletInst.getAccountBalance
    });

    const wallet = chainIDE.setWalletView({
      componentId: 'starknet-wallet-di',
      componentFunc: BottomWallet
    });

    ctx.subscriptions.push(registerWallet, wallet);
  },

  deactivate(_ctx: PluginContext) {},
  store: {},
  context: {
    subscriptions: []
  },
  config: {
    pluginId: 'AuroWallet',
    version: '0.0.1',
    type: PluginType.server,
    active: false,
    internalPlugin: true,
    description: {
      title: 'Auro Wallet',
      icon,
      inactiveIcon,
      description: "Let's begin utilizing the services offered by Auro Wallet"
    }
  }
};
