// DO NOT EDIT THIS FILE
// This file is automatically generated from the webgme-setup-tool.
'use strict';


var config = require('webgme/config/config.default'),
    validateConfig = require('webgme/config/validator');


config.plugin.allowServerExecution = true;

// The paths can be loaded from the webgme-setup.json
config.plugin.basePaths.push('src/plugins');


// Visualizer descriptors

// Add requirejs paths

config.addOn.enable = true;

config.addOn.basePaths.push('./src/addon');

config.mongo.uri = 'mongodb://127.0.0.1:27017/webgme_formula'
validateConfig(config);
module.exports = config;