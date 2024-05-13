import { Icon } from 'office-ui-fabric-react';
import React, { useMemo } from 'react';
import JSONTree from 'react-json-tree';

import { Scroll } from '@modules/common/components';
import { ChainIdeClipboard } from '@modules/common/components/clipboard';

import styles from './outputCard.less';

interface IOutputCard {
  result?: string;
}

export const OutputCard = (props: IOutputCard) => {
  const { result = '' } = props;

  const formattedResult = useMemo(() => {
    try {
      return result !== 'null' ? JSON.parse(result) : '0x';
    } catch (e) {
      return result;
    }
  }, [result]);

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>
        <span>result</span>
        <ChainIdeClipboard className={styles.copyIcon} text={result}>
          <Icon iconName="Copy" />
        </ChainIdeClipboard>
      </h3>
      <Scroll className={styles.scroll}>
        <div className={styles.content}>
          Output:
          {<JSONTree data={formattedResult} hideRoot={true} />}
        </div>
      </Scroll>
    </div>
  );
};
