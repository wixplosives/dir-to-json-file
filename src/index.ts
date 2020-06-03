import { convertDirectoryToJsonObject, IConvertDirectoryToJsonObjectOptions } from './dir-to-json';
import { writeJsonObjectToFile, IWriteJsonObjectToFileOptions } from './json-to-file';

export { writeJsonObjectToFile, IWriteJsonObjectToFileOptions } from './json-to-file';

export type IConvertDirToJsonFileOptions = Pick<IWriteJsonObjectToFileOptions, 'dest'> &
    Pick<IConvertDirectoryToJsonObjectOptions, 'fs' | 'filterPredicate' | 'src'>;

export const convertDirectoryToJsonFile = async ({
    src,
    dest,
    fs,
    filterPredicate,
}: IConvertDirToJsonFileOptions): Promise<void> =>
    writeJsonObjectToFile({
        data: await convertDirectoryToJsonObject({ src, fs, filterPredicate }),
        dest,
    });
