/*globals define*/
/*jshint node:true, browser:true*/

/**
 * Generated by PluginGenerator 0.14.0 from webgme on Fri Feb 05 2016 08:50:41 GMT-0600 (CST).
 */

define([
    'plugin/PluginConfig',
    'plugin/PluginBase',
    'text!./metadata.json',
    'common/util/ejs',
    'plugin/Export2FORMULA/Export2FORMULA/Templates/Templates'
], function (
    PluginConfig,
    PluginBase,
    pluginMetadata,
    ejs,
    TEMPLATES) {
    'use strict';

    pluginMetadata = JSON.parse(pluginMetadata);

    /**
     * Initializes a new instance of Export2FORMULA.
     * @class
     * @augments {PluginBase}
     * @classdesc This class represents the plugin Export2FORMULA.
     * @constructor
     */
    var Export2FORMULA = function () {
        // Call base class' constructor.
        PluginBase.call(this);
        this.pluginMetadata = pluginMetadata;
    };

    Export2FORMULA.metadata = pluginMetadata;

    // Prototypical inheritance from PluginBase.
    Export2FORMULA.prototype = Object.create(PluginBase.prototype);
    Export2FORMULA.prototype.constructor = Export2FORMULA;

    /**
     * Main function for the plugin to execute. This will perform the execution.
     * Notes:
     * - Always log with the provided logger.[error,warning,info,debug].
     * - Do NOT put any user interaction logic UI, etc. inside this method.
     * - callback always has to be called even if error happened.
     *
     * @param {function(string, plugin.PluginResult)} callback - the result callback
     */
    Export2FORMULA.prototype.main = function (callback) {
        // Use self to access core, project, result, logger etc from PluginBase.
        // These are all instantiated at this point.
        var self = this,
            nodeObject;

        self.currentConfig = self.getCurrentConfig();
        // Using the logger.
        // self.logger.debug('This is a debug message.');
        // self.logger.info('This is an info message.');
        // self.logger.warn('This is a warning message.');
        // self.logger.error('This is an error message.');

        // Using the coreAPI to make changes.

        nodeObject = self.activeNode;

        // export the entire project for now
        self.core.loadSubTree(self.rootNode, function (err, nodes) {
          if (err) {
            // Handle error
            callback(err);
            return;
          }
          // Here we have access to all the nodes that is contained in node
          // at any level.

          // sort nodes based on ids
          nodes.sort(function (n1, n2) {
            return self.core.getPath(n1).localeCompare(self.core.getPath(n2));
          });

          // First transform ejs-files into js files (needed for client-side runs) -> run Templates/combine_templates.js.
          // See instructions in file. You must run this after any modifications to the ejs template.
          var testData = {
            projectName: self.projectId,
            hash: self.commitHash,
            domainName: self.projectName,
            formulaVersion: self.currentConfig.formulaVersion,
            formula: {},
            nodes: {}
          };

          if (testData.formulaVersion === '1') {
            testData.formula = {
              lineEnding: '',
              true: 'true',
              false: 'false'
            }
          } else if (testData.formulaVersion === '2') {
            testData.formula = {
              lineEnding: '.',
              true: 'TRUE',
              false: 'FALSE'
            }
          } else {
            // throw error
          }


          var i,
              j,
              names,
              thisNode,
              thisData,
              jsonMeta;

          for (i = 0; i < nodes.length; i += 1) {
            thisNode = nodes[i];
            if (thisNode !== self.core.getBaseType(thisNode)) {
              // skip anything that is not meta type
              //continue;
            }

            jsonMeta = self.core.getJsonMeta(thisNode);
            thisData = {
              id: self.core.getPath(thisNode),
              guid: self.core.getGuid(thisNode),
              base: self.core.getPath(self.core.getBase(thisNode)),
              meta: self.core.getPath(self.core.getBaseType(thisNode)),
              name: self.core.getAttribute(thisNode, 'name'),
              parent: self.core.getPath(self.core.getParent(thisNode)),
              isAbstract: self.core.isAbstract(thisNode),
              isMetaType: self.core.getBaseType(thisNode) === thisNode,
              jsonMeta: jsonMeta,
              attributes: {}, // TODO: add values
              pointers: {} // TODO: add values
            };
            testData.nodes[self.core.getPath(thisNode)] = thisData;

            names = Object.keys(jsonMeta.attributes);
            for (j = 0; j < names.length; j += 1) {
              thisData.attributes[names[j]] = self.core.getAttribute(thisNode, names[j]);
            }

            names = Object.keys(jsonMeta.pointers);
            for (j = 0; j < names.length; j += 1) {
              thisData.pointers[names[j]] = self.core.getPointerPath(thisNode, names[j]);
            }
            //console.log(jsonMeta);
          }


          var templatePY = ejs.render(TEMPLATES['model.4ml.ejs'], testData);
          var templatePY2 = ejs.render(TEMPLATES['model2.4ml.ejs'], testData);
          //self.logger.info(templatePY);

          if (typeof window === 'undefined') {
            var fs = require('fs');
            fs.writeFileSync('model.4ml', templatePY);
            fs.writeFileSync('model2.4ml', templatePY2);
          }

          var files = {
            'generatedFiles/model.4ml': templatePY,
            'generatedFiles/model2.4ml': templatePY2
          }
          var artifact = self.blobClient.createArtifact('templateFiles');
          artifact.addFiles(files, function (err) {
              if (err) {
                  callback(err, self.result);
                  return;
              }
              self.blobClient.saveAllArtifacts(function (err, hashes) {
                  if (err) {
                      callback(err, self.result);
                      return;
                  }
                  // This will add a download hyperlink in the result-dialog.
                  self.result.addArtifact(hashes[0]);
                  self.result.setSuccess(true);
                  callback(null, self.result);
              });
          });
        });
    };

    return Export2FORMULA;
});
