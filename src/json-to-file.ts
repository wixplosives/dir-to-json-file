import { IDirectoryContents } from '@file-services/types';
import fs, { WriteStream } from 'fs';
import { extname } from 'path';

export interface IWriteJsonObjectToFileOptions {
    dest: string;
    data: IDirectoryContents;
}

export async function writeJsonObjectToFile({
    data,
    dest,
}: IWriteJsonObjectToFileOptions): Promise<void> {
    const fsStream = fs.createWriteStream(dest, {
        encoding: 'utf8',
    });
    await writeDirectoryKeyToStream(fsStream, data);
    return new Promise((res) => {
        fsStream.end('\n', res);
    });
}

function writeJsonKeyToStream(
    key: string,
    value: string,
    stream: WriteStream,
    indentation: string
) {
    if (!extname(key)) {
        try {
            stream.write(`${indentation}${JSON.stringify(key)}: ${JSON.stringify(value)}`);
        } catch (ex) {
            stream.write(`${indentation}${JSON.stringify(key)}: "${value}"`);
        }
    } else {
        stream.write(`${indentation}${JSON.stringify(key)}: ${JSON.stringify(value)}`);
    }
}

async function writeDirectoryKeyToStream(
    stream: WriteStream,
    value: IDirectoryContents,
    key?: string,
    indentation = ''
) {
    stream.write(`${indentation}${key ? `${JSON.stringify(key)}: ` : ''}{`);
    stream.write('\r\n');
    const entries = Object.entries(value);
    for (let i = 0; i < entries.length; i++) {
        const newIndentation = indentation + '  ';
        const [dirKey, dirValue] = entries[i];
        if (typeof dirValue === 'string') {
            try {
                writeJsonKeyToStream(dirKey, dirValue, stream, newIndentation);
                if (i < entries.length - 1) {
                    stream.write(',');
                }
            } catch (ex) {
                /** */
            }
        } else {
            await writeDirectoryKeyToStream(stream, dirValue, dirKey, newIndentation);
            if (i < entries.length - 1) {
                stream.write(',');
            }
        }
        stream.write('\r\n');
    }
    stream.write(`${indentation}}`);
}
