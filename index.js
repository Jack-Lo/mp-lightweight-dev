const path = require('path');
const fs = require('fs');
// const inquirer = require('inquirer');

const projectConfigPath = path.resolve(__dirname, '../project.config.json');
const projectConfigJson = getJson(projectConfigPath);
const { miniprogramRoot, condition } = projectConfigJson;
const appPath = path.resolve(__dirname, '..', miniprogramRoot, './app.json');
const appJson = getJson(appPath);
const configPath = path.resolve(__dirname, './config.json');
const configJson = getJson(configPath);
const distPath = path.resolve(__dirname, './dist');

const { pages, subpackages, preloadRule } = appJson;
const conditionPages = condition.miniprogram.list;

// inquirer
//   .prompt([
//     /* Pass your questions in here */
//   ])
//   .then(answers => {
//     // Use user feedback for... whatever!!
//   })
//   .catch(error => {
//     if(error.isTtyError) {
//       // Prompt couldn't be rendered in the current environment
//     } else {
//       // Something else when wrong
//     }
//   });

start();

function start() {
  saveFilesToDist();
}

function getJson(filePath) {
  const str = fs.readFileSync(filePath, { encoding: 'utf8' });
  return JSON.parse(str);
}

function saveFilesToDist() {
  const inited = configJson.switch === 'on';
  if (!inited) {
    fs.copyFileSync(projectConfigPath, path.resolve(distPath, './project.config.json'));
    fs.copyFileSync(appPath, path.resolve(distPath, './app.json'));
    // fs.writeFileSync(configPath, JSON.stringify({ ...configJson, switch: 'on' }, null, '  '))
  }
}
