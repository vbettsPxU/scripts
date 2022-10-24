const glob = require('glob');
const fs = require('fs');

const translateableProps = [
  'info',
  'content',
  'label',
  'name',
  'group',
  'placeholder',
  'category',
  'unit'
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
  'https://behance.net/',
  'https://www.clubhouse.com/',
  'https://discord.com/',
  'https://dribbble.com/shopify',
  'https://facebook.com/shopify',
  'https://www.flickr.com/',
  'https://www.houzz.com/',
  'https://instagram.com/shopify',
  'https://www.kickstarter.com/',
  'https://linkedin.com/company/shopify',
  'https://medium.com/',
  'https://www.messenger.com/',
  'https://opensea.io/',
  'https://pinterest.com/shopify',
  'https://www.reddit.com/r/shopify/',
  'https://www.shopify.com/content-services/feeds/ecommerce.atom',
  'https://www.snapchat.com/',
  'https://www.spotify.com/',
  'https://tiktok.com/@shopify',
  'https://shopify.tumblr.com/',
  'https://www.twitch.tv/',
  'https://twitter.com/shopify',
  'https://vimeo.com/',
  'https://www.whatsapp.com/',
  'https://youtube.com/user/shopify',
];


const enSchema = {
  sections: {},
  settings_schema: {},
};


const sectionSettingsFiles = glob.sync('./source/sections/**/*.json');
const settingsSchemaFile = './source/config/settings_schema.json';


function processSettings(content, translationPath, sectionKey, blockName = null) {
  let headerCount = 0;
  let paragraphCount = 0;

  const updatedSettings = content.map(setting => {
    let settingId;
    if (setting.id) {
      settingId = setting.id;
    } else if (setting.type === 'header') {
      // if the setting does not have an ID, it is a header or a paragraph setting
      headerCount += 1;
      settingId = `header_${headerCount}`;
    } else if (setting.type === 'paragraph') {
      paragraphCount += 1;
      settingId = `paragraph_${paragraphCount}`;
    }

    let localSchema = enSchema.sections;

    if (translationPath.includes('settings_schema')) {
      localSchema = enSchema.settings_schema;
    }

    if (blockName) {
      localSchema[sectionKey].blocks[blockName][settingId] = {};
    } else {
      localSchema[sectionKey][settingId] = {};
    }

    Object.keys(setting).forEach(settingProp => {
      const settingValue = setting[settingProp];
      if (translateableProps.includes(settingProp) && !ignoreStrings.includes(settingValue) && settingValue.substring(0, 2) !== 't:') {
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
          if (translateableProps.includes(settingProp) && !ignoreStrings.includes(option[settingValue]) && settingValue.substring(0, 2) !== 't:') {
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


    if (translationPath.includes('settings_schema')) {
      enSchema.settings_schema = localSchema;
    } else {
      enSchema.sections = localSchema;
    }

    return setting;
  });

  return updatedSettings;
}

sectionSettingsFiles.forEach(filePath => {
  const fileContent = JSON.parse(fs.readFileSync(filePath));

  const sectionKey = fileContent.name.replace(/\s+/g, '_').toLowerCase();

  enSchema.sections[sectionKey] = {
    name: fileContent.name,
  };

  const translationPath = `t:sections.${sectionKey}`;
  fileContent.name = `${translationPath}.name`;

  if (fileContent.settings.length) {
    fileContent.settings = processSettings(fileContent.settings, translationPath, sectionKey, null);

    // TODO: Account for blocks, presets
    if (fileContent.blocks) {
      enSchema.sections[sectionKey].blocks = {};

      const tempBlocks = fileContent.blocks;

      const blockTranslationPath = `${translationPath}.blocks`

      const updatedBlocks = tempBlocks.map(block => {
        if (block.name) {
          const blockName = block.name.replace(/ /g, '_').toLowerCase();
          enSchema.sections[sectionKey].blocks[blockName] = {
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

      fileContent.blocks = updatedBlocks;
    }

    if (fileContent.presets) {
      const presets = fileContent.presets;

      enSchema.sections[sectionKey].presets = {};

      updatedPresets = presets.map(preset => {
        const presetName = preset.name.replace(/ /g, '_').toLowerCase();
        enSchema.sections[sectionKey].presets[presetName] = {
          name: preset.name,
          category: preset.category,
        };

        preset.name = `${translationPath}.presets.${presetName}.name`;
        preset.category = `${translationPath}.presets.${presetName}.category`;

        return preset;
      });

      fileContent.presets = updatedPresets;
    }
  }

  const fileContentString = JSON.stringify(fileContent, null, 2);

  fs.writeFileSync(filePath, fileContentString);
});

// config/settings_schema

fs.readFileSync(settingsSchemaFile)

const configFileContent = JSON.parse(fs.readFileSync(settingsSchemaFile));

const updatedConfigFile = configFileContent.map(group => {
  if (group.settings) {
    const groupKey = group.name.replace(/ /g, '_').toLowerCase();
    const schemaTranslationPath =`t:settings_schema.${groupKey}`;

    enSchema.settings_schema[groupKey] = {
      name: group.name
    };

    const updatedSettings = processSettings(group.settings, schemaTranslationPath, groupKey);

    group.settings = updatedSettings;
  }
  return group;
});

const configFileString = JSON.stringify(updatedConfigFile, null, 2);

fs.writeFileSync(settingsSchemaFile, configFileString);


const schemaString = JSON.stringify(enSchema, null, 2);

fs.writeFileSync('./en.default.schema.json', schemaString);
