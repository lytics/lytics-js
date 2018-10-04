import { assert } from 'chai';
import { CsvFileReader } from '../FileReaders';
import * as fs from 'fs';
import * as tmp from 'tmp';

describe('CsvFileReader', function () {
    it('should throw an error if the csv file is not well-formed', async function () {
        const file = tmp.fileSync();
        fs.appendFileSync(file.name, 'one,two,three,\n1,2,3\n');
        const reader = new CsvFileReader();
        try {
            await reader.convert(file.name);
            assert.isTrue(false, 'An error should have been thrown.');
        }
        catch (err) {
            assert.isTrue(true, 'Error was thrown.');
        }
        finally {
            file.removeCallback();
        }
    });
    it('should return 0 rows if the csv file has only a header row', async function () {
        const file = tmp.fileSync();
        fs.appendFileSync(file.name, 'one,two,three');
        try {
            const reader = new CsvFileReader();
            const rows = await reader.convert(file.name);
            assert.isDefined(rows);
            assert.isArray(rows);
            assert.equal(rows.length, 0);
        }
        catch (err) {
            assert.isTrue(false, 'No error should be thrown.');
        }
        finally {
            file.removeCallback();
        }
    });
    it('should return 2 rows when no maxrows set', async function () {
        const file = tmp.fileSync();
        fs.appendFileSync(file.name, 'one,two,three\n1,2,3\n4,5,6');
        try {
            const reader = new CsvFileReader();
            const rows = await reader.convert(file.name);
            assert.isDefined(rows);
            assert.isArray(rows);
            assert.equal(rows.length, 2);
        }
        catch (err) {
            assert.isTrue(false, 'No error should be thrown.');
        }
        finally {
            file.removeCallback();
        }
    });
    it('should return 2 rows when maxrows is 0', async function () {
        const file = tmp.fileSync();
        fs.appendFileSync(file.name, 'one,two,three\n1,2,3\n4,5,6');
        try {
            const reader = new CsvFileReader();
            const rows = await reader.convert(file.name);
            assert.isDefined(rows);
            assert.isArray(rows);
            assert.equal(rows.length, 2);
        }
        catch (err) {
            assert.isTrue(false, 'No error should be thrown.');
        }
        finally {
            file.removeCallback();
        }
    });
    it('should return 1 row when maxrows is 1', async function () {
        const file = tmp.fileSync();
        fs.appendFileSync(file.name, 'one,two,three\n1,2,3\n4,5,6');
        try {
            const reader = new CsvFileReader();
            const rows = await reader.convert(file.name, 1);
            assert.isDefined(rows);
            assert.isArray(rows);
            assert.equal(rows.length, 1);
        }
        catch (err) {
            assert.isTrue(false, 'No error should be thrown.');
        }
        finally {
            file.removeCallback();
        }
    });
});
