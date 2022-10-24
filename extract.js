const glob = require('glob');
const fs = require('fs');
const path = require('path');


const filePatterns = [
  './sections/*/*/locales/en.default.schema.json',
  './components/*/*/locales/en.default.schema.json',
  './blocks/*/*/locales/en.default.schema.json',
  './source/locales/en.default.schema.json',
]

const dictionaryPatterns = [
  './de.dictionary.json',
  './es.dictionary.json',
  './it.dictionary.json',
  './fr.dictionary.json',
]

let dictionary;
let missing = {};
let locale;

function extractDict(obj) {
  Object.keys(obj).forEach(key => {
    if (typeof(obj[key]) === 'string') {
      if (Object.keys(dictionary).includes(obj[key])) {
        obj[key] = dictionary[obj[key]];
      } else {
        missing[obj[key]] = obj[key];
        obj[key] = '';
      }
    } else {
      extractDict(obj[key]);
    }
  });
}

dictionaryPatterns.forEach(dictionaryFile => {
  dictionary = JSON.parse(fs.readFileSync(dictionaryFile));

  filePatterns.forEach(pattern => {
    const files = glob.sync(pattern);

    files.forEach(file => {
      locale = JSON.parse(fs.readFileSync(file));

      extractDict(locale);

      const localeString = JSON.stringify(locale, null, 2);
      const localeFilePrefix = dictionaryFile.substring(2, 4);
      const localeFileDir = path.dirname(file);

      fs.writeFileSync(`${localeFileDir}/${localeFilePrefix}.schema.json`, localeString);
    });
  });
});

const missingString = JSON.stringify(missing, null, 2);
fs.writeFileSync(`./missing.en.dictionary.json`, missingString);
