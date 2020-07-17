const fs = require("fs-extra");
const path = require("path");
const process = require("process");

const crtDir = process.cwd();
const configPath = path.resolve(crtDir, "./lightweight.config.json");
let config = null;
let projectConfig = null;

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
    throw new Error("projectConfigPath is empty.");
  }
  return config;
}

/**
 * 获取项目配置信息
 * @param {boolen} force 强制更新
 */
function getProjectConfig(force = false) {
  if (projectConfig && !force) {
    return projectConfig;
  }
  const { projectConfigPath } = config;
  projectConfig = fs.readJSONSync(path.resolve(crtDir, projectConfigPath));
  return projectConfig;
}

module.exports = {
  crtDir,
  configPath,
  getConfig,
  getProjectConfig,
};
