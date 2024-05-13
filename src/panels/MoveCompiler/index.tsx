import { FontIcon, Stack } from 'office-ui-fabric-react';
import Form from 'rc-field-form';
import React, { useCallback, useEffect, useState } from 'react';
import { useIntl } from 'react-intl';

import { ControlSelect } from '@modules/common/components';
import { Scroll } from '@modules/common/components/scroll/scroll';
import { Key, Tree, TreeItem } from '@modules/common/components/tree';
import { toUri } from '@modules/common/utils/fileUtils';
import { useCallTerminal } from '@modules/extensions/chainSupport/nervos/hooks';
import fileSystemService from '@modules/filesystem/service';
import { useProjectState } from '@modules/projects/hooks/useProjectState';

import { useGetPackageJson } from '../../hooks/useGetPackageJson';
import styles from './style.less';

export function MoveCompiler() {
  const [packageJsonContent, setPackageJsonContent] = useState<any>({});

  const [form] = Form.useForm();
  const [expandKeys, setExpandKeys] = useState<Key[]>([]);
  const { formatMessage } = useIntl();
  const { currentProjectId = '' } = useProjectState();

  const { packageJsonPaths } = useGetPackageJson();

  const packageJsonOptions = packageJsonPaths.map((path) => {
    return {
      key: path,
      text: `root/${path}`
    };
  });

  const call = useCallTerminal();

  const _onExpand = useCallback((expandedKeys: Key[]) => {
    setExpandKeys(expandedKeys);
  }, []);

  const callPackageScript = useCallback(
    async (script: string) => {
      const { packageJsonPath } = await form.validateFields();
      const path = packageJsonPath.replace('package.json', '');
      const cdCommand = path ? `cd ${path}&&` : '';
      const callArgs = `${cdCommand}npm install && npm run ${script}`;
      call(callArgs, false);
    },
    [call, form]
  );

  const _handleValuesChange = useCallback(
    async (changeItem) => {
      if (changeItem.packageJsonPath) {
        const content = await fileSystemService.readFileString(
          toUri(currentProjectId, changeItem.packageJsonPath)
        );
        setPackageJsonContent(JSON.parse(content || '{}'));
      }
    },
    [currentProjectId]
  );

  return (
    <div className={styles.compiler}>
      <Scroll>
        <Form
          form={form}
          validateTrigger="onChange"
          onValuesChange={_handleValuesChange}
        >
          <Stack
            tokens={{ childrenGap: 15 }}
            styles={{ root: { padding: '0 12px 30px' } }}
          >
            <ControlSelect
              name="packageJsonPath"
              options={packageJsonOptions}
              label={formatMessage({ id: 'APTOS_MODULE_PACKAGE_PATH' })}
            />
          </Stack>
        </Form>

        {form.getFieldValue('packageJsonPath') && (
          <div>
            <Tree expandKeys={expandKeys} onExpand={_onExpand}>
              <TreeItem itemKey="2" title="package.json">
                <div
                  className={styles.packageScripts}
                  style={{ paddingLeft: 35 }}
                >
                  {Object.keys(packageJsonContent.scripts || {}).map((key) => (
                    <div key={key} className={styles.scriptItem}>
                      <span
                        className={styles.script}
                        title={packageJsonContent.scripts[key]}
                      >
                        {key} -- {packageJsonContent.scripts[key]}
                      </span>

                      <FontIcon
                        onClick={() => callPackageScript(key)}
                        iconName="Play"
                        className={styles.cursor}
                      />
                    </div>
                  ))}
                </div>
              </TreeItem>
            </Tree>
          </div>
        )}
      </Scroll>
    </div>
  );
}
