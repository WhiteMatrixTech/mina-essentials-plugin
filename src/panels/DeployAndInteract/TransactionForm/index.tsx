import React, { useCallback, useEffect, useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useAsyncFn } from 'react-use';
import Form from 'rc-field-form';
import { Stack } from 'office-ui-fabric-react';
import {
  Button,
  ButtonType,
  ControlInput,
  ControlSelect
} from '@modules/common/components';
import { flowService } from '../../../wallet/services';
import { CADENCE_CODE_TYPE } from '../../../wallet/constants';
import { handleOriginInputArgs } from '../../../wallet/utils/codeHelper';
import { useActiveFileState } from '../../../wallet/hooks/useActiveFileState';
import { useFclWallet } from '../../../wallet/hooks/useFclWallet';
import outputService from '@modules/editor/services/outputService';
import { LogSource } from '@modules/editor/services/outputService/IOutputService';
import { validateRequiredField } from '../DeployForm';

export function TransactionForm() {
  const [form] = Form.useForm();
  const { formatMessage } = useIntl();

  const { loggedIn, account: currentUser } = useFclWallet();
  const { cadenceFile, activeFilePath } = useActiveFileState();

  const codeFileOption = useMemo(() => {
    if (cadenceFile?.type === CADENCE_CODE_TYPE.TRANSACTION && activeFilePath) {
      return [
        {
          key: activeFilePath,
          text: activeFilePath
        }
      ];
    }
    return [];
  }, [activeFilePath, cadenceFile?.type]);

  const signOption = useMemo(() => {
    if (currentUser?.address) {
      return [
        {
          key: currentUser?.address,
          text: currentUser?.address
        }
      ];
    }
    return [];
  }, [currentUser?.address]);

  const showArgFields = useMemo(
    () =>
      cadenceFile?.type === CADENCE_CODE_TYPE.TRANSACTION &&
      cadenceFile?.argPairList.length,
    [cadenceFile?.argPairList.length, cadenceFile?.type]
  );

  useEffect(() => {
    if (cadenceFile?.type === CADENCE_CODE_TYPE.TRANSACTION && activeFilePath) {
      form.setFieldsValue({
        codeFile: activeFilePath,
        Signer: currentUser?.address
      });
    }
  }, [activeFilePath, cadenceFile?.type, currentUser?.address, form]);

  const [sendResult, _sendTransaction] = useAsyncFn(
    async (contractCode: string, restArgs: unknown[]) => {
      outputService.handleInfo([
        {
          source: LogSource.INTERACTION,
          msg: formatMessage({ id: 'FLOW_TRANSACTION_SENDING' })
        }
      ]);
      const sendResult = await flowService.transactionInteract(
        contractCode,
        restArgs
      );
      return sendResult;
    },
    []
  );

  const onSendTransaction = useCallback(() => {
    if (!loggedIn) {
      outputService.handleWarn([
        {
          source: LogSource.INTERACTION,
          msg: formatMessage({ id: 'FLOW_WARN_UNAUTHENTICATE' })
        }
      ]);
      return;
    }
    form.validateFields().then((formData) => {
      const { codeFile, ...argsData } = formData;
      console.log('codeFile', codeFile);

      const args = handleOriginInputArgs(argsData, cadenceFile?.argPairList);
      _sendTransaction(cadenceFile?.code || '', args);
    });
  }, [
    _sendTransaction,
    cadenceFile?.argPairList,
    cadenceFile?.code,
    form,
    formatMessage,
    loggedIn
  ]);

  return (
    <Form form={form} validateTrigger="onChange">
      <Stack
        tokens={{ childrenGap: 15 }}
        styles={{ root: { padding: '0 12px 30px' } }}>
        <ControlSelect
          name="codeFile"
          options={codeFileOption}
          label={formatMessage({ id: 'FLOW_TRANSACTION_CODE_FILE' })}
        />
        <ControlSelect
          name="Signer"
          options={signOption}
          label={formatMessage({ id: 'FLOW_TRANSACTION_SIGNERS' })}
        />
        {showArgFields && (
          <Stack key="arguments" tokens={{ childrenGap: 15 }}>
            <FormattedMessage id="FLOW_TRANSACTION_ARGUMENTS" />
            {cadenceFile?.argPairList.map((argPair) => (
              <ControlInput
                key={argPair.key}
                name={argPair.key}
                label={argPair.key}
                placeholder={argPair.type}
                rules={[
                  {
                    validator: (_: unknown, value: string) =>
                      validateRequiredField(value, argPair.key)
                  }
                ]}
              />
            ))}
          </Stack>
        )}
        <Button
          disabled={cadenceFile?.type !== CADENCE_CODE_TYPE.TRANSACTION}
          text={formatMessage({ id: 'FLOW_TRANSACTION_SEND' })}
          loading={sendResult.loading}
          type={ButtonType.PRIMARY}
          onClick={onSendTransaction}
        />
      </Stack>
    </Form>
  );
}
