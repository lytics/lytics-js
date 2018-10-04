import { isArray } from "util";
'use strict';
import * as fs from 'fs';
const neatCsv = require('neat-csv');
const lbl = require('line-by-line');

export interface FileReader {
    convert(filePath: string, maxcount: number): Promise<any[]>;
}
export class CsvFileReader implements FileReader {
    async convert(filePath: string, maxcount: number = 0): Promise<any[]> {
        return new Promise<any[]>(function (resolve, reject) {
            const lines:string[] = [];
            const reader = new lbl(filePath);
            reader.on('error', function(err: Error) {
                reject(err);
            });
            reader.on('line', function(line: string) {
                if (maxcount <= 0 || lines.length < (maxcount+1)) {
                    lines.push(line);
                }
                if (maxcount > 0 && lines.length === (maxcount+1)) {
                    reader.pause();
                    reader.emit('end');
                    return;
                }
            });
            reader.on('end', async function() {
                const csv = lines.join('\n');
                try {
                    const out = await neatCsv(csv, {strict: true});
                    resolve(out);
                }
                catch(err) {
                    reject(err);
                }
            });
        });
    }
}
export class JsonFileReader implements FileReader {
    async convert(filePath: string, maxcount: number): Promise<any[]> {
        const obj = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        if (isArray(obj)) {
            return obj;
        }
        return [obj];
    }
}