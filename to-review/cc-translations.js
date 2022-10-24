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

const enSchema = {
  theme: {},
};


const settingsSchemaFile = './source/config/settings_schema.json';


function processSettings(content, translationPath, sectionKey, blockName = false) {
  let headerCount = 0;
  let paragraphCount = 0;

  const updatedSettings = content.map(setting => {
    let settingId;
    if (setting.id) {
      settingId = setting.id;
    } else if (setting.type === 'header') {
      // if the setting does not have an ID, it is a header or a paragraph setting
      headerCount += 1;
      settingId = `cc_header_${headerCount}`;
    } else if (setting.type === 'paragraph') {
      paragraphCount += 1;
      settingId = `cc_paragraph_${paragraphCount}`;
    }

    const localSchema = enSchema.theme;
    console.log(settingId);

    Object.keys(setting).forEach(settingProp => {
      const settingValue = setting[settingProp];
      if (translateableProps.includes(settingProp) && !ignoreStrings.includes(settingValue)) {
        if (!localSchema[sectionKey][settingId]) {
          localSchema[sectionKey][settingId] = {};
        }
        localSchema[sectionKey][settingId][settingProp] = settingValue;
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


    if (translationPath.includes('settings_schema')) {
      enSchema.theme = localSchema;
    }

    return setting;
  });

  return updatedSettings;
}

fs.readFileSync(settingsSchemaFile)

const configFileContent = JSON.parse(fs.readFileSync(settingsSchemaFile));

const updatedConfigFile = configFileContent.map(group => {
  if (group.settings) {
    const groupKey = group.name.replace(/ /g, '_').toLowerCase();
    const schemaTranslationPath =`t:theme.${groupKey}`;

    enSchema.theme[groupKey] = {
      name: group.name
    };

    group.name = `${schemaTranslationPath}.name`;


    const updatedSettings = processSettings(group.settings, schemaTranslationPath, groupKey);

    group.settings = updatedSettings;
  }
  return group;
});

const configFileString = JSON.stringify(updatedConfigFile, null, 2);

fs.writeFileSync(settingsSchemaFile, configFileString);


const schemaString = JSON.stringify(enSchema, null, 2);

fs.writeFileSync('./source/locales/en.default.schema.json', schemaString);
