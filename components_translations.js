const glob = require('glob');
const fs = require('fs');
const path = require('path');

const translateableProps = [
  'info',
  'content',
  'label',
  'name',
  'group',
  'placeholder',
  'category',
  'unit',
];

const ignoreStrings = [
  'Behance',
  'Clubhouse',
  'Discord',
  'Dribbble',
  'Facebook',
  'Flickr',
  'Houzz',
  'Instagram',
  'Kickstarter',
  'LinkedIn',
  'Messenger',
  'OpenSea',
  'Pinterest',
  'Reddit',
  'RSS',
  'Snapchat',
  'Spotify',
  'TikTok',
  'Tumblr',
  'Twitch',
  'Twitter',
  'Vimeo',
  'WhatsApp',
  'YouTube',
  "https://behance.net/",
  "https://www.clubhouse.com/",
  "https://discord.com/",
  "https://dribbble.com/shopify",
  "https://facebook.com/shopify",
  "https://www.flickr.com/",
  "https://www.houzz.com/",
  "https://instagram.com/shopify",
  "https://www.kickstarter.com/",
  "https://linkedin.com/company/shopify",
  "https://medium.com/",
  "https://www.messenger.com/",
  "https://opensea.io/",
  "https://pinterest.com/shopify",
  "https://www.reddit.com/r/shopify/",
  "https://www.shopify.com/content-services/feeds/ecommerce.atom",
  "https://www.snapchat.com/",
  "https://www.spotify.com/",
  "https://tiktok.com/@shopify",
  "https://shopify.tumblr.com/",
  "https://www.twitch.tv/",
  "https://twitter.com/shopify",
  "https://vimeo.com/",
  "https://www.whatsapp.com/",
  "https://youtube.com/user/shopify"
]

let enSchema = {
  component: {},
  theme: {}
};

// If en.default.schema.json exists, add it to the theme obj in enSchema

const filePatterns = [
  './sections/**/default/*.json',
  './components/**/default/*.json',
  './blocks/**/default/*.json'
]

function getHighestPropCount(parentObj, prop) {
  let count = 0;
  Object.keys(parentObj).forEach(key => {
    if (key.includes(prop)) {
      keyCount = parseInt(key.substr(key.lastIndexOf('_')), 10);
      if (keyCount > count) {
        count = keyCount;
      }
    }
  })

  return count;
}

function processSettings(content, translationPath, sectionKey, blockName = null) {
  let headerCount = 0;
  let paragraphCount = 0;

  const updatedSettings = content.map(setting => {
    let settingId;
    let localSchema = enSchema.component;

    if (translationPath.includes('theme')) {
      localSchema = enSchema.theme;
    }

    if (setting.id) {
      settingId = setting.id;
    } else if (setting.type === 'header') {
      headerCount = getHighestPropCount(localSchema, 'header');
      // if the setting does not have an ID, it is a header or a paragraph setting
      headerCount += 1;
      settingId = `header_${headerCount}`;
    } else if (setting.type === 'paragraph') {
      paragraphCount = getHighestPropCount(localSchema, 'paragraph');
      paragraphCount += 1;
      settingId = `paragraph_${paragraphCount}`;
    }


    if (blockName) {
      localSchema[sectionKey].blocks[blockName][settingId] = {};
    } else {
      localSchema[sectionKey][settingId] = {};
    }

    Object.keys(setting).forEach(settingProp => {
      const settingValue = setting[settingProp];
      if (translateableProps.includes(settingProp) && !ignoreStrings.includes(settingValue)) {
        if (blockName) {
          localSchema[sectionKey].blocks[blockName][settingId][settingProp] = settingValue;
        } else {
          localSchema[sectionKey][settingId][settingProp] = settingValue;
        }
        setting[settingProp] = `${translationPath}.${settingId}.${settingProp}`;
      }
    });

    if (setting.options) {
      let optionCount = 0;
      setting.options.forEach(option => {
        Object.keys(option).forEach(settingProp => {
          const settingValue = option[settingProp];
          if (translateableProps.includes(settingProp) && !ignoreStrings.includes(settingValue)) {
            optionCount += 1;
            const optionSettingProp = `option_${optionCount}`;
            if (blockName) {
              localSchema[sectionKey].blocks[blockName][settingId][optionSettingProp] = settingValue;
            } else {
              localSchema[sectionKey][settingId][optionSettingProp] = settingValue;
            }

            option[settingProp] = `${translationPath}.${settingId}.${optionSettingProp}`;
          }
        });
      });
    }


    if (translationPath.includes('theme')) {
      enSchema.theme = localSchema;
    } else {
      enSchema.component = localSchema;
    }

    return setting;
  });

  return updatedSettings;
}

filePatterns.forEach(pattern => {
  const settingsFiles = glob.sync(pattern);

  settingsFiles.forEach(filePath => {
    //console.log(filePath);
    const fileContent = JSON.parse(fs.readFileSync(filePath));

    let sectionKey;
    if (fileContent.component && Object.keys(fileContent.component).length > 0) {
      if (fileContent.component.name) {
        sectionKey = fileContent.component.name.replace(/ /g, '_').toLowerCase();

        enSchema.component[sectionKey] = {
          name: fileContent.component.name,
        };
      } else {
        const fileName = path.basename(filePath);

        sectionKey = fileName.replace('.json', '').replace(/-/g, '_');

        enSchema.component[sectionKey] = {};
      }

      const translationPath = `t:component.${sectionKey}`;

      if (fileContent.component.name) {
        fileContent.component.name = `${translationPath}.name`;
      }

      if (fileContent.component.settings && fileContent.component.settings.length) {
        fileContent.component.settings = processSettings(fileContent.component.settings, translationPath, sectionKey, null);
      }

      if (fileContent.component.blocks) {
        enSchema.component[sectionKey].blocks = {};

        const tempBlocks = fileContent.component.blocks;

        const blockTranslationPath = `${translationPath}.blocks`

        const updatedBlocks = tempBlocks.map(block => {
          if (block.name) {
            const blockName = block.name.replace(/ /g, '_').toLowerCase();
            enSchema.component[sectionKey].blocks[blockName] = {
              name: block.name
            };
            block.name = `${blockTranslationPath}.${blockName}.name`;
            if (block.settings) {
              const blockSettingTranslationPath = `${blockTranslationPath}.${blockName}`;
              const blockSettings = processSettings(block.settings, blockSettingTranslationPath, sectionKey, blockName);
              block.settings = blockSettings;
            }
          }
          return block;
        })

        fileContent.component.blocks = updatedBlocks;
      }

      if (fileContent.component.presets) {
        const presets = fileContent.component.presets;

        enSchema.component[sectionKey].presets = {};

        updatedPresets = presets.map(preset => {
          const presetName = preset.name.replace(/ /g, '_').toLowerCase();
          enSchema.component[sectionKey].presets[presetName] = {
            name: preset.name,
            category: preset.category,
          };

          preset.name = `${translationPath}.presets.${presetName}.name`;
          preset.category = `${translationPath}.presets.${presetName}.category`;

          return preset;
        });

        fileContent.component.presets = updatedPresets;
      }
    }

    if (fileContent.theme) {
      const themesArray = fileContent.theme.map(theme => {
        const settingsKey = theme.name.replace(/ /g, '_').toLowerCase();

        if (!enSchema.theme[settingsKey]) {
          enSchema.theme[settingsKey] = {
            name: theme.name,
          };
        }

        const translationPath = `t:theme.${settingsKey}`;
        theme.name = `${translationPath}.name`;

        if (theme.settings.length) {
          theme.settings = processSettings(theme.settings, translationPath, settingsKey, null);
        }

        return theme;
      });

      fileContent.theme = themesArray;
    }

    const fileContentString = JSON.stringify(fileContent, null, 2);

    fs.writeFileSync(filePath, fileContentString);

    const schemaString = JSON.stringify(enSchema, null, 2);

    const directoryPath = filePath.substring(0, filePath.lastIndexOf('/'));
    const localeDirPath = `${directoryPath}/locales/`;

    if (!fs.existsSync(localeDirPath)) {
      fs.mkdirSync(localeDirPath);
    }

    const localePath = `${localeDirPath}en.default.schema.json`;

    fs.writeFileSync(`${localePath}`, schemaString);

    enSchema = {
      component: {},
      theme: {},
    };
  });


});

// TODO: config/settings_schema
/*
fs.readFileSync(settingsSchemaFile)

const configFileContent = JSON.parse(fs.readFileSync(settingsSchemaFile));

const updatedConfigFile = configFileContent.map(group => {
  if (group.settings) {
    const groupKey = group.name.replaceAll(' ', '_').toLowerCase();
    const schemaTranslationPath =`t:theme.${groupKey}`;

    enSchema.theme[groupKey] = {
      name: group.name
    };

    const updatedSettings = processSettings(group.settings, schemaTranslationPath, groupKey);

    group.settings = updatedSettings;
  }
  return group;
});

const configFileString = JSON.stringify(updatedConfigFile, null, 2);

fs.writeFileSync(settingsSchemaFile, configFileString);
*/

