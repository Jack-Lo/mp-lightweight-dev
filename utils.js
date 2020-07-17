const fs = require("fs-extra");
const path = require("path");
const process = require("process");

const crtDir = process.cwd();
const configPath = path.resolve(crtDir, "./lightweight.config.json");
let config = null;
let projectConfig = null;
let appConfig = null;

/**
 * 获取配置信息
 * @param {boolen} force 强制更新
 */
function getConfig(force = false) {
  if (config && !force) {
    return config;
  }
  config = fs.readJSONSync(configPath);
  if (!config.projectConfigPath) {
    throw new Error("projectConfigPath is missing in config file!");
  }
  if (!config.devDist) {
    throw new Error("devDist is missing in config file!");
  }
  return config;
}

/**
 * 获取project.config.json信息
 * @param {boolen} force 强制更新
 */
function getProjectConfig(force = false) {
  if (projectConfig && !force) {
    return projectConfig;
  }
  const { projectConfigPath } = config;
  projectConfig = fs.readJSONSync(path.resolve(crtDir, projectConfigPath));
  if (!projectConfig.miniprogramRoot) {
    throw new Error("miniprogramRoot is missing in project.config.json!");
  }
  return projectConfig;
}

/**
 * 获取app.json信息
 * @param {boolen} force 强制更新
 */
function getAppConfig(force = false) {
  if (appConfig && !force) {
    return appConfig;
  }
  const appConfigPath = path.resolve(
    crtDir,
    config.projectConfigPath,
    "..",
    projectConfig.miniprogramRoot,
    "./app.json"
  );
  appConfig = fs.readJSONSync(appConfigPath);
  return appConfig;
}

module.exports = {
  crtDir,
  configPath,
  getConfig,
  getProjectConfig,
  getAppConfig,
};
