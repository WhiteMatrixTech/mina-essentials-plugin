import { useEffect } from 'react';
import { useList, useMount } from 'react-use';
import fileSystemService from '@modules/filesystem/service';
import { IFilesystemIndex } from '@modules/filesystem/service/IFileSystem';
import { useProjectState } from '@modules/projects/hooks/useProjectState';

export function useGetPackageJson() {
  const { currentProjectId = '' } = useProjectState();

  const [packageJsonPaths, { set: setPackageJsonPaths }] = useList<string>();

  useEffect(() => {
    const _filesystemDidChangeEvent = fileSystemService.onFileIndex(
      (fileIndex: IFilesystemIndex) => {
        const paths = fileIndex.indexes.filter((path) =>
          path.endsWith('package.json')
        );
        setPackageJsonPaths(paths);
      }
    );

    return () => {
      _filesystemDidChangeEvent.dispose();
    };
  }, [setPackageJsonPaths]);

  useMount(() => {
    fileSystemService
      .getAllPathByRegex(currentProjectId, `/*package.json$`)
      .then(setPackageJsonPaths)
      .catch(console.error);
  });

  return { packageJsonPaths };
}
