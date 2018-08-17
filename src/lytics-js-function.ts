#!/usr/bin/env node
'use strict';
import { Logger, format, transports, createLogger } from 'winston';
import { isNullOrUndefined } from 'util';
import { LyticsClient } from './LyticsClient';
import chokidar = require('chokidar');
import program = require('commander');
const jsome = require('jsome');

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

program
    .description('Invokes the function, using the specified parameters.')
    .name('function')
    .usage('[options] <name> [param1 param2]')
    .option('-k, --key <key>', 'Lytics API key (if not specified, environment variable LIOKEY is used)')
    .parse(process.argv);
main();

async function main() {
    //
    //validate and initialize
    if (program.args.length == 0) {
        logger.error('Function name must be specified');
        logger.error('Fatal error, aborting');
        return;
    }
    const name = program.args[0];
    const params = program.args.length > 1 ? program.args.slice(1) : [];

    var apikey = program.key;
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
    //
    //
    const client = new LyticsClient(apikey);
    logger.info(`Calling ${name}(${params.join(', ')})`);
    try {
        var result = await client.testFunction(name, params);
        logger.info(`Result: ${result}`);
    }
    catch(err) {
        logger.error(err.message);
    }
}
