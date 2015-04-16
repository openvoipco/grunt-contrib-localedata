'use strict';

var _ = require('lodash');
var path = require('path');

module.exports = function(grunt) {

	grunt.registerMultiTask('localedata', 'Does good stuff.', function() {
		// Merge task-specific and/or target-specific options with these defaults.
		var options = this.options({
      startTag: '//LOCALEDATA',
      endTag: '//ENDLOCALEDATA',
      variableName: 'i18n',
      phrasePrefix: null
		});

		// iterate over all specified file groups
		this.files.forEach(function (f) {
      var varData = {};

      // iterate over all files in a the group
      var locales = f.src.filter(function(filepath) {
        if (grunt.file.isFile(filepath))
          return filepath;
      });

      locales.forEach(function(filepath) {
        var parts = path.basename(filepath).toLowerCase().match(/(.+)\.json/);
        if (parts && parts.length == 2)
          varData[parts[1]] = grunt.file.readJSON(filepath, {encoding: 'utf8'});
      });

      // processing destinations
      grunt.file.expand({}, f.dest).forEach(function(dest) {
        var content = grunt.file.read(dest);
        var start = content.indexOf(options.startTag);
        var end = content.indexOf(options.endTag, start);

        if (start === -1 || end === -1 || start >= end) {
          return;
        } else {
          grunt.log.writeln('Localedata block found in "' + dest + '", processing...');

          // getting padding
          var padding = '';
          var ind = start - 1;
          while(/[^\S\n]/.test(content.charAt(ind))) {
            padding += content.charAt(ind);
            ind -= 1;
          }

          // getting inline options
          var finalOptions = _.clone(options), optionsLine = "";
          ind = start + options.startTag.length;
          while(/[^\n]/.test(content.charAt(ind))) {
            optionsLine += content.charAt(ind);
            ind++;
          }
          _.forEach(_.filter(optionsLine.split(','), function(v) { return v.length > 0; }), function(param, index) {
            switch (index) {
              case 0: // variableName
                finalOptions.variableName = param;
                break;
              case 1:
                finalOptions.phrasePrefix = param;
                break;
            }
          });

          // filtering locale data
          var V = {};
          if (finalOptions.phrasePrefix) {
            _.forEach(varData, function (phrases, locale) {
              V[locale] = {};
              _.forEach(phrases, function(translation, original) {
                if (original.indexOf(finalOptions.phrasePrefix) == 0)
                  V[locale][original.replace(new RegExp("^" + finalOptions.phrasePrefix), '')] = translation;
              });
            });
          } else {
            V = varData;
          }

          // injecting locales
          var newContent = content.substr(0, ind) + grunt.util.linefeed + padding + 'var ' + finalOptions.variableName + ' = ' + JSON.stringify(V) + ';' + grunt.util.linefeed + padding + content.substr(end);
          grunt.file.write(dest, newContent);
          grunt.log.writeln('File "' + dest + '" updated.');
        }

      });


		});

	});

};
