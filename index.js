#!/usr/bin/env node
require("dotenv").config();
const PKG = require('./package.json');
require("@babel/register")(PKG.babel);

require("./src/index");
