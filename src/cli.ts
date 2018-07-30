#!/usr/bin/env node
'use strict';
var program = require('commander');
program
  .version('0.0.5')
  .description('Interact with Lytics from JavaScript')
  .command('watch <dir> [otherDirs]', 'Automatically test queries when LQL or data files change')
  .parse(process.argv);
