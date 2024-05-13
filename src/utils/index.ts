import { toUri } from '@modules/common/utils/fileUtils';
import fileSystemService from '@modules/filesystem/service';
import { outputErrorHandle } from '@modules/plugin/models/errors/errorHandleFactory';

const TOML = require('@iarna/toml');

export async function convertTomlToJson(
  projectId: string,
  path: string
): Promise<any> {
  const content = await fileSystemService
    .readFileString(toUri(projectId, path))
    .catch((e) => {
      outputErrorHandle.handleError((e as Error).message);
    });

  if (!content) {
    return null;
  }

  try {
    const tomlJson = TOML.parse(content);

    return tomlJson;
  } catch (e) {
    console.error(`TOML.parse(${path}) error`, e);
    return null;
  }
}


export function timeout(seconds: number): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, seconds * 1000);
  });
}