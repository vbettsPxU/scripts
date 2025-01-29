const { ShortcutAPI } = require('./shortcut-api');
const fs = require('fs');

const shortcut = new ShortcutAPI(process.env.SHORTCUT_API_TOKEN);

async function main() {
  const EPIC_ID = 195232;

  const templates = await shortcut.getTemplates();
  const TEMPLATE_ID = filterShortcutResultsByName(templates, 'Devkit');

  const workflows = await shortcut.getWorkflows();
  const WORKFLOW = filterShortcutResultsByName(workflows, 'Themes');
  const WORKFLOW_STATE = filterShortcutResultsByName(WORKFLOW['states'], 'Backlog');

  const customFields = await shortcut.getCustomFields();
  const CUSTOM_FIELD = filterShortcutResultsByName(customFields, 'Project');
  const CUSTOM_FIELD_VALUE = filterShortcutResultsByValue(CUSTOM_FIELD.values, 'Turbo');

  let files = fs.readdirSync('./');
  files.forEach(file => {
    if (file.includes('shortcut')) return;

    const formattedFileName = file.replace(/-/g, ' ').replace(/__/g, ' ').replace('.liquid', '');

    const storyName = String(formattedFileName).charAt(0).toUpperCase() + String(formattedFileName).slice(1);

    let storyData = {
      'epic_id': EPIC_ID,
      'workflow_state_id': WORKFLOW_STATE.id,
      'story_template_id': TEMPLATE_ID,
      'custom_fields': [{
        'field_id': CUSTOM_FIELD.id,
        'value_id': CUSTOM_FIELD_VALUE.id
      }],
      'name': storyName
    }

    // create(storyData);

  });
}

function filterShortcutResultsByName(results, filterString) {
  const filtered = results.filter(value => value.name.includes(filterString));

  return filtered[0];
}

function filterShortcutResultsByValue(results, filterString) {
  const filtered = results.filter(value => value.value.includes(filterString));

  return filtered[0];
}

async function create(storyData) {
  try {
    await shortcut.createStoryFromTemplate(storyData);
    console.log('Success: ', storyData.name);

  } catch (e) {
    console.error('Error: ', e.message);
  }
}

main();