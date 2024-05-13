import { Stack } from 'office-ui-fabric-react';
import Form from 'rc-field-form';
import React, { memo, useCallback, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { useMount } from 'react-use';

import { Button, ButtonType, ControlInput } from '@modules/common/components';
import outputService from '@modules/editor/services/outputService';

import { walletService } from '../../../wallets/WalletService';
import { OutputCard } from './outputCard';
import { inputStyles, stackStyles } from './style';

interface IFunctionItemProps {
  contractAddress: string;
  functionData: any;
  functionName: string;
  interactArgs: { [id: string]: string };
  onInputChange: (moduleTag: string, data: { [id: string]: string }) => void;
}

export const FunctionItem = memo((props: IFunctionItemProps) => {
  const {
    contractAddress,
    functionData,
    functionName,
    interactArgs,
    onInputChange
  } = props;

  const [form] = Form.useForm();
  const { formatMessage } = useIntl();
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any>({});

  const _handleValuesChange = useCallback(
    (changeItem) => {
      const newArgsState = {
        ...interactArgs,
        ...changeItem
      };
      onInputChange(`${contractAddress}-${functionData.name}`, newArgsState);
    },
    [functionData.name, interactArgs, contractAddress, onInputChange]
  );

  useMount(() => {
    form.setFieldsValue(interactArgs);
  });

  const onClickSubmit = useCallback(
    (state_mutability: string) => {
      setLoading(true);
      form
        .validateFields()
        .then(async (data) => {
          const inputArgs: string[] = Object.values(data);
          try {
            if (state_mutability === 'view') {
              const res = await walletService.call(
                contractAddress,
                functionName,
                inputArgs
              );
              setResult(res);
              console.log(res, 111);
            }
            if (state_mutability === 'external') {
              const res = await walletService.execute(
                contractAddress,
                functionName,
                inputArgs
              );
              setResult(res);
              await walletService.account!.waitForTransaction(
                res!.transaction_hash
              );
              console.log(res, 111);
            }
          } catch (error) {
            outputService.handleErrorSingle((error as Error).message);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [contractAddress, form, functionName]
  );

  return (
    <Form
      form={form}
      validateTrigger="onSubmit"
      onValuesChange={_handleValuesChange}
    >
      <Stack tokens={{ childrenGap: 15 }} styles={stackStyles}>
        {functionData.inputs.map((arg: any) => (
          <ControlInput
            styles={inputStyles}
            borderless={true}
            key={arg.name}
            name={arg.name}
            label={arg.name}
            placeholder={arg.type}
          />
        ))}
        <Button
          loading={loading}
          type={ButtonType.PRIMARY}
          onClick={() => onClickSubmit(functionData.state_mutability)}
        >
          {formatMessage({ id: 'COMMON_EXECUTE' })}
        </Button>

        {Object.keys(result).length && <OutputCard result={result} />}
      </Stack>
    </Form>
  );
});
