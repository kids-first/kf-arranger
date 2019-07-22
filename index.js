#!/usr/bin/env node
require('dotenv').config();
const babelCfg = fs.readFileSync('.babelrc', 'utf-8');
require('@babel/register')(babelCfg);

// Necessary to polyfill Babel (replaces @babel/polyfill since 7.4.0)
// see https://babeljs.io/docs/en/7.4.0/babel-polyfill
require('core-js/stable');
require('regenerator-runtime/runtime');

require('./src/index');
