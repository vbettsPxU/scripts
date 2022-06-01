const glob = require('glob');
const fs = require('fs');
const path = require('path');

const filePatterns = [
  './sections/**/default/locales/en.default.schema.json',
  './components/**/default/locales/en.default.schema.json',
  './blocks/**/default/locales/en.default.schema.json',
  './source/locales/en.default.schema.json',
]

let dictionary = {};

if (fs.existsSync('./en.dictionary.json')) {
  dictionary = JSON.parse(fs.readFileSync('./en.dictionary.json'));
}

function buildDict(obj) {
  Object.keys(obj).forEach(key => {
    if (typeof(obj[key]) === 'string') {
      dictionary[obj[key]] = obj[key];
    } else {
      buildDict(obj[key]);
    }
  });
}

filePatterns.forEach(pattern => {
  const files = glob.sync(pattern);

  files.forEach(file => {
    const localeContent = JSON.parse(fs.readFileSync(file));
    buildDict(localeContent);
  });
});

const dictString = JSON.stringify(dictionary, Object.keys(dictionary).sort(), 2);
//const dictString = JSON.stringify(dictionary, null, 2);

fs.writeFileSync('en.dictionary.json', dictString);

