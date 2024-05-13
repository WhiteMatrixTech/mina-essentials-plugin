import { useEffect, useState } from "react";
import { useList, useMount } from 'react-use';
import fileSystemService from '@modules/filesystem/service';
import { IFilesystemIndex } from '@modules/filesystem/service/IFileSystem';
import { useProjectState } from '@modules/projects/hooks/useProjectState';

import { toUri } from '@modules/common/utils/fileUtils';
import { outputErrorHandle } from '@modules/plugin/models/errors/errorHandleFactory';

export function useGetStarknetCompiled() {
  const { currentProjectId = '' } = useProjectState();

  const [compiledResultPaths, { set: setCompiledResultPaths }] = useList<string>();
  const [casmResultPaths, { set: setCasmResultPaths }] = useList<string>();

  const [compiledResult, setCompiledResult] = useState<any>('')
  const [casmResult, setCasmResult] = useState<any>('')

  useEffect(() => {
    const _filesystemDidChangeEvent = fileSystemService.onFileIndex(
      (fileIndex: IFilesystemIndex) => {
        const paths = fileIndex.indexes.filter((path) =>
          path.endsWith('.contract_class.json')
        );
        setCompiledResultPaths(paths);

        const paths2 = fileIndex.indexes.filter((path) =>
          path.endsWith('.compiled_contract_class.json')
        );
        setCasmResultPaths(paths2)
      }
    );

    return () => {
      _filesystemDidChangeEvent.dispose();
    };
  }, [setCompiledResultPaths, setCasmResultPaths]);

  useMount(() => {
    fileSystemService
      .getAllPathByRegex(currentProjectId, `/*\.contract_class.json$`)
      .then(setCompiledResultPaths)
      .catch(console.error);

    fileSystemService
      .getAllPathByRegex(currentProjectId, `/*compiled_contract_class.json$`)
      .then(setCasmResultPaths)
      .catch(console.error);
  });

  useEffect(() => {
    if (currentProjectId) {
      if (compiledResultPaths[0]) {
        fileSystemService
          .readFileString(toUri(currentProjectId, compiledResultPaths[0]))
          .then(result => {
            setCompiledResult(JSON.parse(result))
          })
          .catch((e) => {
            outputErrorHandle.handleError((e as Error).message);
          });
      }

      if (casmResultPaths[0]) {
        fileSystemService
          .readFileString(toUri(currentProjectId, casmResultPaths[0]))
          .then(result => {
            setCasmResult(JSON.parse(result))
          })
          .catch((e) => {
            outputErrorHandle.handleError((e as Error).message);
          });
      }
    }
  }, [compiledResultPaths, casmResultPaths, currentProjectId])

  return { compiledResult, casmResult };
}