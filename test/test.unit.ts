import { expect } from 'chai';
import { createMemoryFs } from '@file-services/memory';
import { IDirectoryContents } from '@file-services/types';
import { convertDirectoryToJsonObject } from '../src/dir-to-json';
import { writeJsonObjectToFile } from '../src/json-to-file';
import { join } from 'path';
import fs from '@file-services/node';
import { convertDirectoryToJsonFile } from '../src';

describe('converts directory to a json', () => {
    const disposables = new Set<() => Promise<void> | void>();
    afterEach(async () => {
        for (const dispose of [...disposables].reverse()) {
            await dispose();
        }
        disposables.clear();
    });

    it('converts directory to object', async () => {
        const contents: IDirectoryContents = {
            src: {
                'test.txt': 'this is a test content',
                'test2.txt': 'this is a test content 2',
                'test3.txt': 'this is a test content 3',
            },
            dist: {
                dir: {
                    'inner-test.txt': 'this is an inner file test conetent',
                },
            },
        };

        const memFs = createMemoryFs(contents);

        expect(await convertDirectoryToJsonObject({ src: '/', fs: memFs })).to.eql(contents);
    });

    it('allows filtering paths when filtering', async () => {
        const contents: IDirectoryContents = {
            src: {
                'test.txt': 'this is a test content',
                'test2.txt': 'this is a test content 2',
                'test3.txt': 'this is a test content 3',
            },
            dist: {
                dir: {
                    'inner-test.txt': 'this is an inner file test conetent',
                },
            },
        };

        const memFs = createMemoryFs(contents);

        expect(
            await convertDirectoryToJsonObject({
                src: '/',
                fs: memFs,
                filterPredicate: (filePath) => filePath.includes('dist/dir'),
            })
        ).to.eql({ ...contents, dist: {} });
    });

    it('writes directory contents to json', async () => {
        const contents: IDirectoryContents = {
            src: {
                'test.txt': 'this is a test content',
                'test2.txt': 'this is a test content 2',
                'test3.txt': 'this is a test content 3',
            },
            dist: {
                dir: {
                    'inner-test.txt': 'this is an inner file test conetent',
                },
            },
        };
        const jsonFileName = join(process.cwd(), 'test.json');
        await writeJsonObjectToFile({ data: { ...contents }, dest: jsonFileName });
        disposables.add(() => fs.promises.unlink(jsonFileName));
        expect(await fs.promises.readJsonFile(jsonFileName)).to.eql(contents);
    });

    it('reads directory content and writes it to file', async function () {
        this.timeout(20_000);
        const jsonFileName = join(process.cwd(), 'test.json');
        const src = process.cwd();
        const directoryContents = await convertDirectoryToJsonObject({
            src,
            fs,
        });

        await convertDirectoryToJsonFile({ src, dest: jsonFileName, fs });
        disposables.add(() => fs.promises.unlink(jsonFileName));

        const createdFileContents = await fs.promises.readJsonFile(jsonFileName);
        for (const [key, value] of Object.entries(createdFileContents as IDirectoryContents)) {
            expect(value).to.eql(directoryContents[key]);
        }
    });
});
