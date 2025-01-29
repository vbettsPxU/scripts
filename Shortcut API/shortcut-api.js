const https = require('https');

class ShortcutAPI {
  constructor(apiToken) {
    this.apiToken = apiToken;
    this.baseURL = 'api.app.shortcut.com';
    this.apiVersion = 'v3';
  }

  makeRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: this.baseURL,
        path: `/api/${this.apiVersion}/${path}`,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Shortcut-Token': this.apiToken
        }
      };

      const req = https.request(options, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          try {
            const parsedData = JSON.parse(responseData);
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(parsedData);
            } else {
              reject(new Error(`API Error: ${res.statusCode} - ${JSON.stringify(parsedData)}`));
            }
          } catch (error) {
            reject(new Error(`Failed to parse response: ${error.message}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(new Error(`Request failed: ${error.message}`));
      });

      if (data) {
        req.write(JSON.stringify(data));
      }

      req.end();
    });
  }

  // Stories
  async getStories(query = {}) {
    const queryString = new URLSearchParams(query).toString();
    return this.makeRequest('GET', `stories?${queryString}`);
  }

  async getStory(storyId) {
    return this.makeRequest('GET', `stories/${storyId}`);
  }

  async createStory(storyData) {
    return this.makeRequest('POST', 'stories', storyData);
  }

  async createStoryFromTemplate(storyData) {
    return this.makeRequest('POST', 'stories/from-template', storyData);
  }

  // Templates
  async getTemplates() {
    return this.makeRequest('GET', 'entity-templates');
  }

  async getTemplate(templateId) {
    return this.makeRequest('GET', `entity-templates/${templateId}`);
  }

  // Epics
  async getEpics() {
    return this.makeRequest('GET', 'epics');
  }

  async getEpic(epicId) {
    return this.makeRequest('GET', `epics/${epicId}`);
  }

  // Members
  async getMembers() {
    return this.makeRequest('GET', 'members');
  }

  // Projects/Teams
  async getTeams() {
    return this.makeRequest('GET', 'teams');
  }

  // Iterations
  async getIterations() {
    return this.makeRequest('GET', 'iterations');
  }

  //Workflows
  async getWorkflows() {
    return this.makeRequest('GET', 'workflows');
  }

  //Custom fields
  async getCustomFields() {
    return this.makeRequest('GET', 'custom-fields');
  }

}

// Don't forget to export the class
module.exports = { ShortcutAPI };