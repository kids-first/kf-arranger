#!/usr/bin/env node
require('dotenv').config();
const fs = require('fs');
const babelCfgFile = fs.readFileSync('.babelrc', 'utf-8');
try {
  babelCfg = JSON.parse(babelCfgFile);
} catch (err) {
  console.warn('Error parsing .babelrc file, ignoring');
}
require('@babel/register')(babelCfg);

// Necessary to polyfill Babel (replaces @babel/polyfill since 7.4.0)
// see https://babeljs.io/docs/en/7.4.0/babel-polyfill
require('core-js/stable');
require('regenerator-runtime/runtime');

require('./src/index');
