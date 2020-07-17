const fs = require("fs-extra");
const path = require("path");
const { crtDir, getConfig, getProjectConfig } = require("./utils.js");

try {
  getConfig(true);
  getProjectConfig(true);
} catch (e) {
  console.error(e);
}

/**
 * 镜像同步文件
 */
function mirrorFiles() {
  const { devDist } = getConfig();
  const { miniprogramRoot } = getProjectConfig();
  fs.removeSync(path.resolve(crtDir, devDist));
  fs.copy(
    path.resolve(crtDir, miniprogramRoot),
    path.resolve(crtDir, devDist)
  )
    .then(() => {
      console.error('mirror files done.');
    })
    .catch(console.error);
}

mirrorFiles();

// console.log(getProjectConfig());
