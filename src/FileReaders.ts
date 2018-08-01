import { isArray } from "util";

'use strict';
const fs = require('fs');
const csvdata = require('csvdata');

export interface FileReader {
    convert(filePath: string, maxcount: number): Promise<any[]>;
}
export class CsvFileReader implements FileReader {
    async convert(filePath: string, maxcount: number): Promise<any[]> {
        const records: any[] = [];
        const rows = await csvdata.load(filePath, {
            stream: true,
            log: false
        });
        return new Promise<any[]>((resolve, reject) => {
            rows.on('data', (row:any) => {
                if (records.length >= maxcount) {
                    rows.emit('end');
                    return;
                }
                records.push(row);
            });
            rows.on('end', () => {
                resolve(records);
            });
        });
        return Promise.resolve(records);
    }
}
export class JsonFileReader implements FileReader {
    async convert(filePath: string, maxcount: number): Promise<any[]> {
        const obj = JSON.parse(fs.readFileSync(filePath));
        if (isArray(obj)) {
            return obj;
        }
        return [obj];
    }
}