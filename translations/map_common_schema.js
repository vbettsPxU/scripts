/*
 * Read in schema file
 * Read in path file
 * Use schema values to find 'old' translation paths
 * Create new JSON where each old translation path is mapped to the new t:common... translation path
 * */

const glob = require('glob');
const fs = require('fs');
const path = require('path');


const commonSchemaFile = './common.schema.json';
const pathDictionaryFile = './path.dictionary.json';

const commonSchemaContent = JSON.parse(fs.readFileSync(commonSchemaFile));
const pathDictContent = JSON.parse(fs.readFileSync(pathDictionaryFile));

let pathMap = {};

// pass in schema obj
// path is map to common translation
function buildMap(obj, path = []) {
  Object.keys(obj).forEach(key => {
    if (typeof(obj[key]) === 'string') {
      const finalPath = [...path, key];
      const finalPathString = finalPath.join('.');

      if (pathDictContent[obj[key]]) {
        pathDictContent[obj[key]].forEach(oldPath => {
          const oldPathFormatted = `t:${oldPath}`;
          pathMap[oldPathFormatted] = `t:${finalPathString}`;
        });
      } else {
        console.log(obj[key]);
      }
    } else {
      const newPath = [...path, key];
      buildMap(obj[key], newPath);
    }
  });
}

buildMap(commonSchemaContent);

const mapString = JSON.stringify(pathMap, null, 2);
fs.writeFileSync('common.translation.map.json', mapString);

