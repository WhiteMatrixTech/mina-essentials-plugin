import React from 'react';
import { useIntl } from 'react-intl';
import Collapse from '@modules/common/components/collapse';
import { Scroll } from '@modules/common/components';
import { DeployForm } from './DeployForm';
import { Interact } from './Interact';
// import { TransactionForm } from './TransactionForm';

import style from './DeployAndInteract.less';

const { Panel } = Collapse;

export const DeployAndInteractPanel = () => {
  const { formatMessage } = useIntl();

  return (
    <div className={style.deployAndInteract}>
      <Collapse defaultActiveKey={['Deploy', 'Script', 'Transaction']}>
        <Panel
          key="Deploy"
          title={formatMessage({ id: 'COMMON_DEPLOY_BUTTON' })}
        >
          <Scroll>
            <DeployForm />
          </Scroll>
        </Panel>
        <Panel key="Script" title={formatMessage({ id: 'CONTROLS_INTERACT' })}>
          <Scroll>
            <Interact />
          </Scroll>
        </Panel>
        {/* <Panel
          key="Transaction"
          title={formatMessage({ id: 'FLOW_TRANSACTION' })}>
          <Scroll>
            <TransactionForm />
          </Scroll>
        </Panel> */}
      </Collapse>
    </div>
  );
};
