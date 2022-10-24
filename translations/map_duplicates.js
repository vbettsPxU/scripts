const glob = require('glob');
const fs = require('fs');
const path = require('path');

const filePatterns = [
  '../sections/*/*/locales/en.default.schema.json',
  '../components/*/*/locales/en.default.schema.json',
  '../blocks/*/*/locales/en.default.schema.json',
  '../source/locales/en.default.schema.json',
]

let dictionary = {};
let pathDictionary = {};

function buildDict(obj, path = []) {
  Object.keys(obj).forEach(key => {
    if (typeof(obj[key]) === 'string') {
      dictionary[obj[key]] = obj[key];

      const finalPath = [...path, key];
      const pathString = finalPath.join('.');

      if (obj[key] in pathDictionary) {
        if (!pathDictionary[obj[key]].includes(pathString)) {
          pathDictionary[obj[key]] = [...pathDictionary[obj[key]], pathString];
        }
      } else {
        pathDictionary[obj[key]] = [ pathString ];
      }
    } else {
      const newPath = [...path, key];
      buildDict(obj[key], newPath);
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

Object.keys(dictionary).forEach(key => {
  if (pathDictionary[key].length === 1) {
    delete(pathDictionary[key]);
    delete(dictionary[key]);
  }
});

const dictString = JSON.stringify(dictionary, Object.keys(dictionary).sort(), 2);
const pathDictString = JSON.stringify(pathDictionary, null, 2);

fs.writeFileSync('dictionary.json', dictString);
fs.writeFileSync('path.dictionary.json', pathDictString);

