/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  ProviderError,
  SendTransactionResult
} from '@aurowallet/mina-provider';
import { Field, PrivateKey, PublicKey } from 'o1js';
import { Stack } from 'office-ui-fabric-react';
import Form from 'rc-field-form';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';

import { Button, ButtonType, ControlSelect } from '@modules/common/components';
import { toUri } from '@modules/common/utils/fileUtils';
import { getLocaleMsgFromKey } from '@modules/common/utils/notificationUtil';
import outputService from '@modules/editor/services/outputService';
import fileSystemService from '@modules/filesystem/service';
import { useProjectState } from '@modules/projects/hooks/useProjectState';

import { useGetPackageJson } from '../../../hooks/useGetPackageJson';
import { useGetStarknetCompiled } from '../../../hooks/useGetStarknetCompiled';
import { timeout } from '../../../utils';
import ZkappWorkerClient from '../../../utils/zkappWorkerClient';
import { walletService } from '../../../wallets/WalletService';
import { Imports } from '../Import';
import { DeployDialog } from './DeployDialog';

export function DeployForm() {
  const [form] = Form.useForm();
  const { formatMessage } = useIntl();
  const { currentProjectId } = useProjectState();
  const [logText, setLogText] = useState<string>('');
  const [selectedPackageJsonPath, setSelectedPackageJsonPath] =
    useState<string>('');

  const [contracts, setContracts] = useState<any[]>([]);
  const [selectedContractExports, setSelectedContractExports] = useState<any[]>(
    []
  );
  const [keys, setKeys] = useState({
    publicKey: '',
    privateKey: ''
  });

  const { packageJsonPaths } = useGetPackageJson();

  const packageJsonOptions = packageJsonPaths.map((path) => {
    return {
      key: path,
      text: `root/${path}`
    };
  });

  const onDeploy = useCallback(async () => {
    setLogText('Loading web worker...');
    const zkappWorkerClient = new ZkappWorkerClient();
    await timeout(5);
    setLogText('Done loading web worker');
    await zkappWorkerClient.setActiveInstanceToBerkeley(
      'https://api.minascan.io/node/devnet/v1'
    );
    const mina = (window as any).mina;
    await timeout(1);
    if (mina == null) {
      return outputService.handleErrorSingle('Wallet not connected');
    }
    const publicKeyBase58: string = (await mina.requestAccounts())[0];
    const publicKey = PublicKey.fromBase58(publicKeyBase58);

    setLogText(`Using key:${publicKey.toBase58()}`);
    setLogText('Checking if fee payer account exists...');
    const res = await zkappWorkerClient.fetchAccount({
      publicKey: publicKey!
    });
    let zkAppPrivateKey = PrivateKey.random();
    let zkAppAddress = zkAppPrivateKey.toPublicKey();
    const _keys = {
      publicKey: PublicKey.toBase58(zkAppAddress),
      privateKey: PrivateKey.toBase58(zkAppPrivateKey)
    };
    setKeys(_keys);

    const contract = contracts.find(
      (o) => o.path === form.getFieldValue('contract')
    );
    if (contract) {
      // let zkAppPrivateKey = PrivateKey.fromBase58(keys.privateKey);
      // let zkAppAddress = PublicKey.fromBase58(keys.publicKey);
      await zkappWorkerClient.loadContract(
        contract.content,
        form.getFieldValue('contractExport')
      );

      setLogText('Compiling zkApp...');
      await zkappWorkerClient.compileContract();
      setLogText('zkApp compiled');
      console.log(zkAppAddress, 111);
      await zkappWorkerClient.initZkappInstance(
        PublicKey.fromBase58(_keys.publicKey)
      );

      await zkappWorkerClient.createDeployTransaction(
        PrivateKey.fromBase58(_keys.privateKey),
        publicKeyBase58
      );
      await zkappWorkerClient.proveUpdateTransaction();
      const transactionJSON = await zkappWorkerClient.getTransactionJSON();
      setLogText('waiting wallet confirm');
      const sendRes: SendTransactionResult | ProviderError = await (
        window as any
      ).mina.sendTransaction({
        transaction: transactionJSON,
        feePayer: {
          memo: ''
        }
      });
      setLogText('');
    }
  }, [contracts, form]);

  const handleValuesChange = useCallback(
    async (changeItem) => {
      if (changeItem.packageJsonPath) {
        setSelectedPackageJsonPath(changeItem.packageJsonPath);
      }

      if (changeItem.contract) {
        const contract = contracts.find((o) => o.path === changeItem.contract);
        if (contract) {
          const blob = new Blob([contract.content], {
            type: 'text/javascript'
          });
          const url = URL.createObjectURL(blob);

          const module = await import(/* webpackIgnore: true */ url);
          setSelectedContractExports(Object.keys(module));
        }
      }

      // if (changeItem.contractExport) {
      //   const contract = contracts.find(
      //     (o) => o.path === form.getFieldValue('contract')
      //   );
      //   if (contract) {
      //     const blob = new Blob([contract.content], {
      //       type: 'text/javascript'
      //     });
      //     const url = URL.createObjectURL(blob);

      //     const module = await import(/* webpackIgnore: true */ url);
      //     // setSelectedContractModule(module[changeItem.contractExport]);
      //     console.log(module[changeItem.contractExport], 111);
      //   }
      // }
    },
    [contracts]
  );

  useEffect(() => {
    (async () => {
      if (!selectedPackageJsonPath) setContracts([]);
      const dir = selectedPackageJsonPath?.replace('/package.json', '');

      const paths = await fileSystemService.getAllPathByRegex(
        currentProjectId || '',
        `${dir}/build/.*.js$`
      );

      const _contracts = await Promise.all(
        paths
          .filter((o) => !o.includes('test'))
          .map(async (path) => {
            const content = await fileSystemService.readFileString(
              toUri(currentProjectId || '', path)
            );
            return { path, content };
          })
      );
      setContracts(
        _contracts.filter((o) => o.content.includes('extends SmartContract'))
      );
    })();
  }, [currentProjectId, selectedPackageJsonPath]);

  // useEffect(() => {
  //   const value = form.getFieldValue('tomlPath');
  //   if (!value) {
  //     form.setFieldValue('packageJsonPath', packageJsonPaths[0]);
  //     if (currentProjectId && packageJsonPaths[0]) {
  //       setSelectedPackageJsonPath(packageJsonPaths[0]);
  //       // convertTomlToJson(currentProjectId, movePackagePaths[0]).then(
  //       //   (info) => {
  //       //     form.setFieldsValue({ packageName: info?.package.name });
  //       //     setPackageName(info?.package.name);
  //       //   }
  //       // );
  //     }
  //   }
  // }, [form, packageJsonPaths, currentProjectId]);

  // useEffect(() => {
  //   fileSystemService
  //     .readFileString(
  //       toUri(currentProjectId || '', 'contracts/build/src/Add.js')
  //     )
  //     .then(async (content) => {
  //       const blob = new Blob([content], { type: 'text/javascript' });
  //       const url = URL.createObjectURL(blob);

  //       const modules = await import(/* webpackIgnore: true */ url);
  //       modules.Add.compile().then((res: any) => {
  //         console.log(res, 111);
  //       });
  //     });
  // }, [currentProjectId]);

  return (
    <Form
      form={form}
      validateTrigger="onChange"
      onValuesChange={handleValuesChange}
    >
      <Stack
        tokens={{ childrenGap: 15 }}
        styles={{ root: { padding: '20px 12px 30px' } }}
      >
        <ControlSelect
          name="packageJsonPath"
          options={packageJsonOptions}
          label={formatMessage({ id: 'APTOS_MODULE_PACKAGE_PATH' })}
        />

        {form.getFieldValue('packageJsonPath') && (
          <ControlSelect
            name="contract"
            options={contracts.map((o) => ({
              key: o.path,
              text: o.path
            }))}
            label="Contract"
          />
        )}

        {form.getFieldValue('contract') && (
          <ControlSelect
            name="contractExport"
            options={selectedContractExports.map((o) => ({
              key: o,
              text: o
            }))}
            label="Export Function"
          />
        )}

        <div>{logText}</div>

        <Button text="Deploy" type={ButtonType.PRIMARY} onClick={onDeploy} />

        <Imports />
      </Stack>
    </Form>
  );
}

export function validateRequiredField(value: string, fieldName: string) {
  return new Promise<String | void>((resolve, reject) => {
    if (!value) {
      reject(
        getLocaleMsgFromKey('FLOW_WARN_INPUT_ARGUMENT', {
          argumentName: fieldName
        })
      );
    }
    resolve();
  });
}
