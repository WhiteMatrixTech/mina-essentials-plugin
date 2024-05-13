import React, { useCallback } from 'react';
import { useProjectState } from '@modules/projects/hooks/useProjectState';
import { useBoolean } from '@uifabric/react-hooks';
import { Button, ButtonType } from '@modules/common/components/button';
import { Stack } from 'office-ui-fabric-react';
import { useIntl } from 'react-intl';
import { ImportDetail } from './importDetail';

export function Imports() {
  const [importHidden, { setTrue: hide, setFalse: open }] = useBoolean(true);

  const _openImports = useCallback(() => {
    open();
  }, [open]);
  const _closeImports = useCallback(() => {
    hide();
  }, [hide]);

  const { currentProject } = useProjectState();
  const intl = useIntl();
  if (currentProject && currentProject.id) {
    return (
      <Stack styles={{ root: { textAlign: 'center' } }}>
        <Button
          type={ButtonType.LINK}
          text={intl.formatMessage({ id: 'CONTROLS_IMPORT_DEPLOYED_PACKAGE' })}
          onClick={_openImports}
        />
        <ImportDetail hidden={importHidden} close={_closeImports} />
      </Stack>
    );
  }
  return null;
}
