# This is a simple grunt plugin that inserts localedata in a JS file

It was written for sails.js project, so the following configs are adapted for it:

tasks\config\localedata.js:
```
module.exports = function(grunt) {

	grunt.config.set('localedata', {

    default: {
			options: {
        startTag: '//LOCALEDATA',
        endTag: '//ENDLOCALEDATA',
        variableName: 'i18n',
        phrasePrefix: null
			},
      files: [
        { src: 'config/locales/*.json', dest: require('../pipeline').localeDataFiles }
      ]
		}

	});

	grunt.loadNpmTasks('grunt-contrib-localedata');

};
```

tasks\register\default.js:
```
module.exports = function (grunt) {
	grunt.registerTask('default', ['compileAssets', 'linkAssets', 'localedata', 'watch']);
};
```

tasks\pipeline.js:
```
// Files that need to be prepared by localedata
module.exports.localeDataFiles = [
  'views/main/index.ejs'
];
```

And then just use it in any JS (client side) source file views/main/index.ejs:
```
<script>
  
  //LOCALEDATA,myVar,somePhrasesPrefix
  //ENDLOCALEDATA
  
  // Some other static source code / content ...
  
</script>
```

Grunt takes locale data from config/locales, it takes all files with .json extension, it uses file name as a locale key for an object. After running grunt the file will be changed to something like that:
```
<script>

  //LOCALEDATA,myVar,somePhrasesPrefix
  var myVar = {"en":{},"ru":{"New contact":"Новый контакт","Available":"Онлайн"}};
  //ENDLOCALEDATA
  
  // Some other static source code / content ...
  
</script>
```

As you can see, plugin supports inline config override, you can use 2 optional settings after "startTag", in the example above it is "//LOCALEDATA,i18n,somePhrasesPrefix", where "myVar" overrides "variableName" parameter and "somePhrasesPrefix" overrides "phrasePrefix". I think all the options are self explanatory, just a few words about "phrasePrefix". It is useful if you don't want to expose all phrases from dictionary and need only some of them where original phrase starts with prefix.


If you need more help - let me know...
