#!/usr/bin/env node
'use strict';
import { Logger, format, transports, createLogger } from 'winston';
import { isNullOrUndefined } from 'util';
import { LyticsClient } from './LyticsClient';
import { FileReader, CsvFileReader, JsonFileReader } from './FileReaders';
import fs = require('fs');
import path = require('path');
import chokidar = require('chokidar');
import commander = require('commander');
const jsome = require('jsome');

const default_max_records: number = 5;
const default_log_level: string = 'info';
const default_file_event_delay: number = 50;

const logger: Logger = createLogger({
    format: format.combine(
        format.colorize({ all: true }),
        format.timestamp({
            format: 'YYYY-MM-DD hh:mm:ss.SSS'
        }),
        format.printf(info => {
            return `${info.timestamp}\t${info.level}\t${info.message}`;
        })
    ),
    transports: [new transports.Console()]
});

commander
    .description('Monitor the specified directories for files changes. When an LQL file or a data file that corresponds to an LQL file changes, the data in the data file is used to test the LQL using the specified Lytics account.')
    .name('watch')
    .usage('[options] <dir> [otherDirs]')
    .option('-k, --key <key>', 'Lytics API key (if not specified, environment variable LIOKEY is used)')
    .option('-m, --max <max>', 'Maximum number of records read from the data file (default: 5)', parseInt)
    .option('-l, --log <log>', 'Log level', /^(error|warn|info|verbose|debug)$/i, default_log_level)
    .option('-C, --no-color', 'Disable colorized JSON output')
    .parse(process.argv);
main();

async function main() {
    //
    //validate and initialize
    if (commander.args.length == 0) {
        logger.error('At least one directory must be specified');
        logger.error('Fatal error, aborting');
        return;
    }
    const dirs = getAccessibleDirectories(commander.args as string[]);
    if (dirs.length == 0) {
        logger.error('At least one directory must be accessible');
        logger.error('Fatal error, aborting');
        return;
    }
    var apikey = commander.key;
    if (isNullOrUndefined(apikey)) {
        apikey = process.env.LIOKEY;
        if (isNullOrUndefined(apikey)) {
            logger.error('API key must be specified as an option or in the environment variable LIOKEY');
            logger.error('Fatal error, aborting');
            return;
        }
        logger.info(`API key from environment variable LIOKEY: ${apikey}`);
    }
    else {
        logger.info(`API key from options: ${apikey}`);
    }
    const maxrecords = (isNullOrUndefined(commander.max) || isNaN(commander.max)) ? default_max_records : commander.max;
    logger.info(`Maximum number of records to read: ${maxrecords}`);
    if (logger.level !== commander.log) {
        logger.info(`Changing log level: ${logger.level} => ${commander.log}`);
        logger.level = commander.log;
    }
    jsome.params.colored = commander.color;
    logger.info(`Colorize JSON output: ${commander.color}`);
    startWatch(dirs, maxrecords, apikey);
}

function getAccessibleDirectories(args: string[]): string[] {
    const accessiblePaths:string[] = [];
    var paths = args.map(p => path.resolve(p));
    paths = Array.from(new Set(paths));
    let isValid = true;
    paths.forEach(function (p: string) {
        try {
            fs.accessSync(p);
            accessiblePaths.push(p);
        }
        catch (err) {
            logger.error(`Directory is not accessible: ${p}`);
        }
    });
    return accessiblePaths;
}

async function startWatch(dirs: string[], maxrecords: number, apikey: string) {
    if (!dirs || dirs.length == 0) {
        return;
    }
    if (!apikey || apikey.trim().length == 0) {
        return;
    }
    //
    //validate apikey
    const client = new LyticsClient(apikey);
    try {
        const accounts = await client.getAccounts();
        logger.info(`Connected to Lytics: ${accounts.map(a => a.aid).join()}`);
    }
    catch (err) {
        if (err.response.status == 401) {
            logger.error(`Unable to connect to Lytics. Make sure you entered a valid API key.`);
            return;
        }
        logger.error(`Unable to connect to Lytics: ${err}`);
        return;
    }
    //
    //
    for (let i = 0; i < dirs.length; i++) {
        const folderPath = path.resolve(dirs[i]);
        chokidar.watch(folderPath, {
            atomic: default_file_event_delay
        }).on('change', async (filePath:string, stats:any) => {
            try {
                console.log('\n');
                logger.info(`File changed: ${filePath}`);
                const p = path.parse(filePath);
                const pathLql = getFileName(p, ['lql']);
                if (!pathLql) {
                    return;
                }
                const pathData = getFileName(p, ['csv', 'json']);
                if (!pathData) {
                    return;
                }
                const lql = await readFileToString(pathLql);
                const records = await readRecordsFromFile(pathData, maxrecords);
                for (let i = 0; i < records.length; i++) {
                    const label = `Result ${(i + 1)}/${records.length}`;
                    const record = records[i];
                    try {
                        var result = await client.testQuery(lql, record);
                        logger.info(`${label}:`);
                        jsome(result);
                    }
                    catch (err) {
                        logger.error(`${label} failed: ${err}`);
                    }
                }
                if (records.length === 0) {
                    logger.error(`File has no records or is not well-formed: ${pathData}`);
                }
                else {
                    logger.info(`Done handling records: ${records.length}`);
                }
            }
            catch (err) {
                logger.error(`${err}`);
            }
        });
        logger.info(`Watching folder: ${folderPath}`);
    }
}

function getFileName(parsedPath: path.ParsedPath, supportedExtentions: string[]): string | undefined {
    for (let i = 0; i < supportedExtentions.length; i++) {
        const ext = supportedExtentions[i];
        const p = path.join(parsedPath.dir, `${parsedPath.name}.${ext}`);
        if (fs.existsSync(p)) {
            return p;
        }
    }
}
function readFileToString(filePath: string): Promise<string> {
    return new Promise(function (resolve, reject) {
        fs.readFile(filePath, (err, data) => {
            err ? reject(err) : resolve(data.toString());
        });
    });
}
async function readRecordsFromFile(filePath: string, maxRecords: number): Promise<any[]> {
    let reader: FileReader | undefined;
    const ext = path.parse(filePath).ext;
    switch (ext) {
        case '.csv':
            logger.debug(`Using file reader: CSV`);
            reader = new CsvFileReader();
            break;
        case '.json':
            logger.debug(`Using file reader: JSON`);
            reader = new JsonFileReader();
            break;
    }
    if (!reader) {
        return Promise.reject(`File type is not supported: ${ext}`);
    }
    return reader.convert(filePath, maxRecords);
}