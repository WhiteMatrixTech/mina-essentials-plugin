import { useEffect } from 'react';
import { useList, useMount } from 'react-use';
import fileSystemService from '@modules/filesystem/service';
import { IFilesystemIndex } from '@modules/filesystem/service/IFileSystem';
import { useProjectState } from '@modules/projects/hooks/useProjectState';

export function useGetMovePackage() {
  const { currentProjectId = '' } = useProjectState();

  const [movePackagePaths, { set: setMovePackagePaths }] = useList<string>();

  useEffect(() => {
    const _filesystemDidChangeEvent = fileSystemService.onFileIndex(
      (fileIndex: IFilesystemIndex) => {
        const paths = fileIndex.indexes.filter((path) =>
          path.endsWith('Scarb.toml')
        );
        setMovePackagePaths(paths);
      }
    );

    return () => {
      _filesystemDidChangeEvent.dispose();
    };
  }, [setMovePackagePaths]);

  useMount(() => {
    fileSystemService
      .getAllPathByRegex(currentProjectId, `/*Scarb.toml$`)
      .then(setMovePackagePaths)
      .catch(console.error);
  });

  return { movePackagePaths };
}
