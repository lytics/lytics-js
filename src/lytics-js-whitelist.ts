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
    .description('Provides access to the whitelist that determines which user fields are available to the Lytics API.')
    .name('whitelist')
    .usage('[options] <aid> [list|add|remove] [field]')
    .option('-k, --key <key>', 'Lytics API key (if not specified, environment variable LIOKEY is used)')
    .option('-a, --aid <aid>', 'Lytics account ID whose whitelist is used')
    .parse(process.argv);
main();

async function list(aid:number, client: LyticsClient) {
    var fields = await client.getWhitelistFields(aid);
    if (fields.length == 0) {
        logger.info('No fields are currently whitelisted.');
        return;
    }
    logger.info(`${fields.length} fields are currently whitelisted.`);
    fields.forEach((field, index) => {
        logger.info(`  ${index + 1}. ${field}`);
    })
}
function validateParameters(params:string[]): boolean {
    if (!params || params.length == 0 || !params[0] || params[0].trim().length == 0) {
        logger.error('A field name is required in the specified mode.');
        return false;
    }
    if (params.length > 1) {
        logger.error('Only 1 field name is supported in the specified mode.');
        return false;
    }
    return true;
}
async function add(aid:number, params:string[], client: LyticsClient) {
    if (!validateParameters(params)) {
        return Promise.resolve();
    }
    const field = params[0];
    logger.info(`Field: ${field}`);
    const current = await client.getWhitelistFields(aid);
    if (current.indexOf(field) != -1) {
        logger.info(`The specified field is already whitelisted.`);
        return Promise.resolve();
    }

    const wasAdded = await client.setWhitelistFieldStatus(aid, field, true);
    if (wasAdded) {
        logger.info(`The specified field was added to the whitelist.`);
        return Promise.resolve();
    }
    else {
        logger.info(`The specified field was not added to the whitelist.`);
        return Promise.resolve();
    }
}
async function remove(aid:number, params:string[], client: LyticsClient) {
    if (!validateParameters(params)) {
        return Promise.resolve();
    }
    const field = params[0];
    logger.info(`Field: ${field}`);
    const current = await client.getWhitelistFields(aid);
    if (current.indexOf(field) == -1) {
        logger.info(`The specified field is not currently whitelist.`);
        return Promise.resolve();
    }

    const wasRemoved = await client.setWhitelistFieldStatus(aid, field, false);
    if (wasRemoved) {
        logger.info(`The specified field was removed from the whitelist.`);
        return Promise.resolve();
    }
    else {
        logger.info(`The specified field was not removed from the whitelist.`);
        return Promise.resolve();
    }
}
async function main() {
    //
    //validate and initialize
    console.log(program.args);
    if (program.args.length == 0) {
        logger.error('Mode must be specified');
        logger.error('Fatal error, aborting');
        return;
    }

    var apikey = program.key;
    if (isNullOrUndefined(apikey)) {
        apikey = process.env.LIOKEY;
        if (isNullOrUndefined(apikey)) {
            logger.error('API key must be specified as an option or in the environment variable LIOKEY');
            return;
        }
        logger.info(`API key from environment variable LIOKEY: ${apikey}`);
    }
    else {
        logger.info(`API key from options: ${apikey}`);
    }

    var aid = +program.aid;
    if (isNaN(aid) || aid == 0) {
        logger.error('Valid account ID must be specified as an option.');
        return;
    }
    else {
        logger.info(`Account ID from options: ${aid}`);
    }
    //
    //
    const client = new LyticsClient(apikey);
    const account = await client.getAccount(aid);
    if (!account) {
        logger.error('The specified account ID does not exist or cannot be accessed using the specified API key.');
        return;
    }

    const mode = program.args[0];
    logger.info(`Mode: ${mode}`);
    const params = program.args.length > 1 ? program.args.slice(1) : [];
    if (mode == 'list') {
        await list(aid, client);
        return;
    }
    else if (mode == 'add') {
        await add(aid, params, client);
        return;
    }
    else if (mode == 'remove') {
        await remove(aid, params, client);
        return;
    }
    logger.error(`Unsupported mode was specified: ${mode}`);
}
