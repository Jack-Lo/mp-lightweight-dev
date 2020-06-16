const path = require('path');
const fs = require('fs-extra');
const process = require('process');
const inquirer = require('inquirer');

const crtPath = process.cwd();
const configPath = path.resolve(__dirname, './config.json');
const configJson = fs.readJsonSync(configPath);
const projectConfigPath = path.resolve(crtPath, './project.config.json');
const projectConfigJson = fs.readJsonSync(projectConfigPath);
const { miniprogramRoot } = projectConfigJson;
const appPath = path.resolve(crtPath, configJson.switch === 'on' ? configJson.miniprogramRoot : miniprogramRoot, './app.json');
const appJson = fs.readJsonSync(appPath);
const distPath = path.resolve(__dirname, './dist');
const miniprogramRootDev = 'client_dev/';

const { pages, subpackages } = appJson;

inquirer
  .prompt([
    {
      type: "checkbox",
      name: "packages",
      choices: subpackages.map(p => p.root),
    },
  ])
  .then((answers) => {
    const { packages } = answers;
    if (packages && packages.length) {
      const packagesMap = packages.reduce((pV, cV) => {
        pV[cV] = true;
        return pV;
      }, {});
      const excludes = subpackages.filter(pk => !packagesMap[pk.root]);
      const distClientPath = path.resolve(projectConfigPath, '../', miniprogramRootDev);
      fs.copySync(path.resolve(projectConfigPath, '../', configJson.switch === 'on' ? configJson.miniprogramRoot : miniprogramRoot), distClientPath);
      excludes.forEach(pk => {
        fs.remove(path.resolve(distClientPath, pk.root), err => {
          if (err) {
            console.error(err);
          }
        });
      });
      const pks = subpackages.filter(pk => packagesMap[pk.root]);
      fs.writeJSONSync(path.resolve(distClientPath, './app.json'), {
        ...appJson,
        pages: Array.prototype.concat.apply(pages, pks.map(pk => pk.pages.map(p => `${pk.root}/${p}`))),
        subpackages: [],
        preloadRule: {},
      }, {
        spaces: 2,
      });
      fs.writeJSONSync(projectConfigPath, {
        ...projectConfigJson,
        miniprogramRoot: miniprogramRootDev,
      }, {
        spaces: 2,
      });
      if (configJson.switch !== 'on') {
        fs.writeJSONSync(configPath, {
          ...configJson,
          switch: 'on',
          miniprogramRoot,
        }, {
          spaces: 2,
        });
      }
    }
  })
  .catch(console.error);
