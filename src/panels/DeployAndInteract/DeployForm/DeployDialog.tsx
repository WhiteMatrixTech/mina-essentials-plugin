import {
  DialogFooter,
  DialogType,
  Dialog as FluentDialog,
  Stack
} from 'office-ui-fabric-react';
import Form from 'rc-field-form';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Button, ButtonType, ControlInput } from '@modules/common/components';
import { toUri } from '@modules/common/utils/fileUtils';
import fileSystemService from '@modules/filesystem/service';
import { useProjectState } from '@modules/projects/hooks/useProjectState';

import { walletService } from '../../../wallets/WalletService';

// .build/{contractName}:${contractAddress}.deployed
// 包含这几个字段： abi, classHash, contractAddress, accountAddress, receipt, transactionHash

export interface IProps {
  hidden: boolean;
  classHash: string;
  close: () => void;
  compiledResult: any;
  root?: string;
  name?: string;
}

const dialogContentProps = {
  type: DialogType.close,
  title: 'Deploy'
};

export function DeployDialog({
  hidden,
  close,
  classHash,
  compiledResult,
  root,
  name
}: IProps) {
  const [form] = Form.useForm();
  const { currentProjectId } = useProjectState();

  const [isDeploying, setDeploying] = useState(false);

  const _onDismiss = useCallback(() => {
    close();
  }, [close]);

  const _onOk = useCallback(async () => {
    const values = await form.validateFields();
    const { classhash, ...rest } = values;
    setDeploying(true);
    try {
      const res = await walletService?.account?.deploy(
        {
          classHash: classhash,
          constructorCalldata: Object.values(rest)
        },
        { maxFee: 1e18 }
      );
      const txReceipt = await walletService?.account?.waitForTransaction(
        res!.transaction_hash
      );
      await fileSystemService.createFileString(
        toUri(
          currentProjectId || '',
          `.build/${name}:${res!.contract_address[0]}:${
            walletService.network
          }.deployed`
        ),
        JSON.stringify({
          classHash: classhash,
          transactionHash: res!.transaction_hash,
          receipt: txReceipt,
          abi: compiledResult.abi,
          contractAddress: res!.contract_address[0]
        })
      );
      _onDismiss();
    } catch (e) {
      //
    }
    setDeploying(false);
  }, [form, currentProjectId, compiledResult.abi, _onDismiss, name]);

  const constructorInputs = useMemo(() => {
    return (
      compiledResult.abi?.find((o: any) => o.type === 'constructor')?.inputs ||
      []
    );
  }, [compiledResult]);

  useEffect(() => {
    if (classHash) {
      form.setFieldValue('classhash', classHash);
    }
  }, [classHash, form]);

  return (
    <FluentDialog
      hidden={hidden}
      onDismiss={_onDismiss}
      minWidth={480}
      maxWidth={480}
      dialogContentProps={dialogContentProps}
    >
      <Form form={form} validateTrigger="onChange">
        <Stack tokens={{ childrenGap: 15 }}>
          <ControlInput
            name="classhash"
            label="Class Hash"
            rules={[
              {
                required: true,
                message: 'classhash is required'
              }
            ]}
          />
          <div>Constructor params</div>
          {constructorInputs.map((o: any) => (
            <div key={o.name}>
              <ControlInput
                name={o.name}
                label={o.name}
                required
                placeholder={o.type}
                rules={[
                  {
                    required: true,
                    message: `${o.name} is required`
                  }
                ]}
              />
            </div>
          ))}
        </Stack>
      </Form>
      <DialogFooter>
        <Button
          type={ButtonType.PRIMARY}
          onClick={_onOk}
          text="Deploy"
          style={{ width: '100%' }}
          loading={isDeploying}
        />
      </DialogFooter>
    </FluentDialog>
  );
}
