import React, { useCallback, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import {
  Dialog as FluentDialog,
  DialogFooter,
  DialogType,
  IStackProps,
  Stack
} from 'office-ui-fabric-react';
import Form, { useForm } from 'rc-field-form';
import { useProjectState } from '@modules/projects/hooks/useProjectState';
import { toUri } from '@modules/common/utils/fileUtils';
import { Button, ButtonType, ControlInput } from '@modules/common/components';
import fileSystemService from '@modules/filesystem/service';

import style from './styles.less';
import {
  walletService,
  WalletServiceEventType
} from '../../../wallets/WalletService';

export interface IDetailProps {
  hidden: boolean;
  close: () => void;
}
const dialogContentProps = {
  type: DialogType.close,
  title: <FormattedMessage id="COMMON_IMPORT" />
};

const columnProps: Partial<IStackProps> = {
  tokens: { childrenGap: 15 }
};

export function ImportDetail({ hidden, close }: IDetailProps) {
  const [form] = useForm();
  const { currentProjectId = '' } = useProjectState();

  useEffect(() => {
    const dispose = walletService.onWalletServiceEmit(({ type }) => {
      if (type === WalletServiceEventType.CHAIN_CHANGE) {
        form.setFieldsValue({ network: walletService.network });
      }
    });

    return dispose.dispose;
  }, [form]);

  const _onDismiss = useCallback(() => {
    close();
  }, [close]);

  const _onOk = useCallback(async () => {
    try {
      const value = await form.validateFields();
      const module = await walletService.getPublishedModule(value.packageId);
      const path = `deploy/${value.packageName}-${value.packageId}-${value.network}-published.json`;
      fileSystemService.createFileString(
        toUri(currentProjectId, path),
        JSON.stringify(module)
      );
      _onDismiss();
    } catch (e) {
      console.log(e);
    }
  }, [_onDismiss, currentProjectId, form]);

  return (
    <FluentDialog
      hidden={hidden}
      onDismiss={_onDismiss}
      minWidth={480}
      maxWidth={480}
      dialogContentProps={dialogContentProps}
    >
      <Form form={form} validateTrigger="onChange">
        <Stack {...columnProps} className={style.detail}>
          <ControlInput
            name="network"
            required={true}
            readOnly={true}
            initialValue={walletService.network}
            label="Network"
          />
          <ControlInput name="packageName" label="Package Name" />
          <ControlInput
            name="packageId"
            required={true}
            rules={[{ validator: validateAddress }]}
            label="Package ID"
          />
        </Stack>
      </Form>
      <DialogFooter>
        <Button type={ButtonType.PRIMARY} onClick={_onOk} text="Import" />
      </DialogFooter>
    </FluentDialog>
  );
}

function validateAddress(_: unknown, value: string) {
  return new Promise<String | void>((resolve, reject) => {
    if (!value) {
      reject('please input address');
    }
    // if (!value.startsWith('0x')) {
    //   reject('address is start with "0x"');
    // }
    // if (!/^[A-Za-z0-9]{42}$/.test(value)) {
    //   reject('please input right address (42 letter/number)');
    // }
    resolve();
  });
}
