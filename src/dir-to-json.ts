import { IDirectoryContents, IFileSystem } from '@file-services/types';
import { join } from 'path';

export interface IConvertDirectoryToJsonObjectOptions {
    src: string;
    fs: IFileSystem;
    filterPredicate?: (filePath: string) => boolean;
}

export async function convertDirectoryToJsonObject({
    src,
    fs,
    filterPredicate,
}: IConvertDirectoryToJsonObjectOptions): Promise<IDirectoryContents> {
    const directoryContents: IDirectoryContents = {};
    for (const entity of await fs.promises.readdir(src, { withFileTypes: true })) {
        const entityPath = join(src, entity.name);
        if (entity.isSymbolicLink() || filterPredicate?.(entityPath)) {
            continue;
        } else {
            directoryContents[entity.name] = entity.isFile()
                ? await fs.promises.readFile(entityPath, 'utf8')
                : await convertDirectoryToJsonObject({
                      src: entityPath,
                      fs,
                      filterPredicate,
                  });
        }
    }

    return directoryContents;
}
