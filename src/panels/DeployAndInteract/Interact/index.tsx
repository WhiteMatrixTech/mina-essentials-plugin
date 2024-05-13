/* eslint-disable @typescript-eslint/no-unsafe-call */
import cs from 'classnames';
import { FontIcon, Spinner, SpinnerSize } from 'office-ui-fabric-react';
import React, { useCallback, useEffect, useState } from 'react';

import { ChainIdeClipboard } from '@modules/common/components/clipboard';
import { Key, Tree, TreeItem } from '@modules/common/components/tree';
import { toUri } from '@modules/common/utils/fileUtils';
import { transformAddress } from '@modules/editor/utils/wallet';
import { DeleteAllContractLogo } from '@modules/extensions/chainSupport/chain33/views/interact/interactPanel';
import { chainIDEProxyImpl } from '@modules/extensions/client/chainIdeProxyImpl';
import fileSystemService from '@modules/filesystem/service';
import { useProjectState } from '@modules/projects/hooks/useProjectState';

import { useWalletSelectorSate } from '@views/workspace/workspaceDetail/header/walletSelector/hooks/useWalletSelectorSate';

import { useGetMovePackage } from '../../../hooks/useGetMovePackage';
import { convertTomlToJson } from '../../../utils';
import { NetworkType, walletService } from '../../../wallets/WalletService';
import { FunctionItem } from './FunctionItem';
import styles from './interact.less';

export function Interact() {
  const { currentProjectId } = useProjectState();
  const [expandKeys, setExpandKeys] = useState<Key[]>([]);
  const [walletNetwork, setWalletNetwork] = useState<string>('');
  const [interactArgs, setInteractArgs] = useState<Record<any, any>>({});
  const [deployedPackages, setDeployedPackages] = useState<Record<string, any>>(
    {}
  );
  const {
    walletInstData: { currentChainID }
  } = useWalletSelectorSate();

  const [deleteLoading, setDeleteLoading] = useState(false);
  const [, setPackageName] = useState<string>('');
  const [loadingPath, setLoadingPath] = useState('');

  const { movePackagePaths } = useGetMovePackage();

  const _onExpand = useCallback((expandedKeys: Key[]) => {
    setExpandKeys(expandedKeys);
  }, []);

  const removeStorageFile = useCallback(
    (path: string) => {
      if (currentProjectId) {
        setLoadingPath(path);
        chainIDEProxyImpl.fileSystemService
          .delete(toUri(currentProjectId, `.build/${path}`))
          .then(() => {
            // const storage = new LocalStorage();
            // const newExpandKeys = expandKeys.filter((h) => {
            //   return !h.toString().includes(path);
            // });
            // storage.set('new/ui/aptos/interact', newExpandKeys);
          })
          .catch((e) => {
            // outputService.handleErrorSingle(
            //   getLocaleMsgFromKey(
            //     'COMPILE_LOG_ERROR_WHILE_REMOVE_DEPLOY_FILE',
            //     {
            //       message: e.message
            //     }
            //   ),
            //   LogSource.DEPLOY
            // );
          })
          .finally(() => {
            setLoadingPath('');
          });
      }
    },
    [currentProjectId]
  );

  const handleDeployedFileChanged = useCallback(() => {
    if (currentProjectId) {
      const network = walletService.network;
      chainIDEProxyImpl.fileSystemService
        .getAllPathByRegex(currentProjectId, `.build/.*.:${network}.deployed`)
        .then(async (files: string[]) => {
          const packages: Record<string, any> = {};
          for (const file of files) {
            if (file.split('-')[2] === walletNetwork && file) {
              packages[file.replace('.build/', '')] = JSON.parse(
                await chainIDEProxyImpl.fileSystemService.readFileString(
                  toUri(currentProjectId, file)
                )
              );
            }
          }
          setDeployedPackages({ ...packages });
        });
    }
  }, [currentProjectId, walletNetwork, setDeployedPackages]);

  useEffect(() => {
    const disposable =
      chainIDEProxyImpl.fileSystemService.onFilesystemDidChange(() => {
        handleDeployedFileChanged();
      });

    const walletServiceDisposable = walletService.onWalletServiceEmit(() => {
      handleDeployedFileChanged();
      setWalletNetwork(walletService.network);
    });

    return () => {
      disposable.dispose();
      walletServiceDisposable.dispose();
    };
  }, [currentProjectId, handleDeployedFileChanged]);

  useEffect(() => {
    handleDeployedFileChanged();
  }, [handleDeployedFileChanged]);

  useEffect(() => {
    if (movePackagePaths.length && currentProjectId) {
      convertTomlToJson(currentProjectId, movePackagePaths[0]).then((info) => {
        setPackageName(info?.package.name);
      });
    }
  }, [movePackagePaths, currentProjectId]);

  useEffect(() => {
    if (currentChainID) {
      setWalletNetwork(currentChainID.split(':')[1]);
    }
  }, [currentChainID]);

  useEffect(() => {
    if (Object.keys(deployedPackages).length === 0) {
      setDeleteLoading(false);
    }
  }, [deployedPackages]);

  function onDeleteAllContract(e: React.MouseEvent<HTMLElement, MouseEvent>) {
    setDeleteLoading(true);
    Object.keys(deployedPackages).map((file) => {
      e.stopPropagation();
      fileSystemService.delete(toUri(currentProjectId || '', `.build/${file}`));
    });
  }

  if (!currentChainID) {
    return <div></div>;
  }

  return (
    <div className={styles.treeWrap}>
      {Object.keys(deployedPackages).length >= 1 && (
        <DeleteAllContractLogo
          deleteAllContractIng={deleteLoading}
          onDeleteAllContract={onDeleteAllContract}
        />
      )}
      <Tree expandKeys={expandKeys} onExpand={_onExpand}>
        {Object.keys(deployedPackages).map((file) => (
          <TreeItem
            key={file}
            itemKey={file}
            expandKeys={[file]}
            title={`${file.split(':')[0]}@${
              transformAddress(file.split(':')[1]) as string
            }`}
            actions={
              <>
                <FontIcon
                  onClick={(e) => {
                    e.stopPropagation();
                    _openModuleLink(walletService.network, file.split(':')[1]);
                  }}
                  className={styles.cursor}
                  iconName="OpenInNewWindow"
                />
                <ChainIdeClipboard text={file.split(':')[1]}>
                  <FontIcon className={styles.actionIcon} iconName="Copy" />
                </ChainIdeClipboard>

                {loadingPath === file ? (
                  <Spinner
                    size={SpinnerSize.small}
                    className={styles.actionIcon}
                  />
                ) : (
                  <FontIcon
                    className={styles.actionIcon}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeStorageFile(file);
                    }}
                    iconName="Delete"
                  />
                )}
              </>
            }
          >
            {deployedPackages[file]?.abi
              .find((o: any) => o.type === 'interface')
              ?.items.map((item: any) => {
                return renderInteractFunction(
                  file.split(':')[1],
                  item,
                  item.name
                );
              })}
            {/* {Object.keys(deployedPackages[file]).map((moduleName) => (
              <TreeItem
                key={moduleName}
                itemKey={moduleName}
                expandKeys={[moduleName]}
                title={moduleName}
              >
                {Object.keys(
                  deployedPackages[file][moduleName]['exposedFunctions']
                )
                  .filter((functionName: string) => {
                    const functionData =
                      deployedPackages[file][moduleName]['exposedFunctions'][
                        functionName
                      ];
                    return (
                      functionData.visibility === 'Public' &&
                      functionData.isEntry
                    );
                  })
                  .map((functionName: any) => {
                    const functionData =
                      deployedPackages[file][moduleName]['exposedFunctions'][
                        functionName
                      ];
                    return renderInteractFunction(
                      deployedPackages[file][moduleName]['address'],
                      moduleName,
                      functionData,
                      functionName
                    );
                  })}
              </TreeItem>
            ))} */}
          </TreeItem>
        ))}
      </Tree>
    </div>
  );

  function renderInteractFunction(
    contractAddress: string,
    functionData: any,
    functionName: string
  ) {
    return (
      <TreeItem
        PrefixIcon={_renderPrefixIcon()}
        className={styles.treeItemWrap}
        title={functionName}
        key={`${contractAddress}::${functionName}`}
        itemKey={`${contractAddress}::${functionName}`}
      >
        <FunctionItem
          contractAddress={contractAddress}
          functionData={functionData}
          functionName={functionName}
          onInputChange={() => {}}
          interactArgs={interactArgs[`${contractAddress}-${functionName}`]}
        />
      </TreeItem>
    );
  }
}

function _renderPrefixIcon() {
  return <FontIcon className={cs(styles.yellow)} iconName="Footer" />;
}

function _openModuleLink(network: NetworkType, address: string) {
  window.open(`https://sepolia.starkscan.co/contract/${address}`);
}
