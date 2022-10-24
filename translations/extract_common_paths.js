// Update schema files with new, common translation paths

const glob = require('glob');
const fs = require('fs');
const path = require('path');

const filePatterns = ['../sections/*/*/*.json','../components/*/*/*.json','../blocks/*/*/*.json',];

//const filePatterns = ['../sections/blog-posts/default/blog-posts.json'];
const commonMapContent = JSON.parse(fs.readFileSync('./common.translation.map.json'));

function searchJSON(obj) {
  // Navigate recursively through JSON until we get to a value of type string
  // then replace the string (old translation path) with the new, common translation path

  Object.keys(obj).forEach(key => {
    if (typeof(obj[key]) === 'string') {
      if (obj[key] in commonMapContent) {
        obj[key] = commonMapContent[obj[key]];
      }
    } else {
      searchJSON(obj[key]);
    }
  });
}

filePatterns.forEach(pattern => {
  const files = glob.sync(pattern);

  files.forEach(file => {
    const settingContent = JSON.parse(fs.readFileSync(file));
    searchJSON(settingContent);

    const newContent = JSON.stringify(settingContent, null, 2);

    fs.writeFileSync(file, newContent);
  });
});


