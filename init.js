const fs = require("fs-extra");
const path = require("path");
const {
  crtDir,
  getConfig,
  getProjectConfig,
  getAppConfig,
  getAppConfigPath,
} = require("./utils.js");

try {
  getConfig(true);
  getProjectConfig(true);
} catch (e) {
  console.error(e);
}

function getExcludePagesMap() {
  const { pages, subpackages, tabBar } = getAppConfig();
  const subpackagesMap = subpackages.reduce((pV, cV) => {
    pV[cV.root] = cV.pages;
    return pV;
  }, {});
  const allPages = Array.prototype.concat.apply(
    pages,
    subpackages.map((s) => s.pages.map((p) => `${s.root}/${p}`))
  );
  const config = getConfig();
  const includePagesMap = Array.prototype.concat
    .apply(
      (config.pages || []).concat(tabBar.list.map(t => t.pagePath)),
      (config.subpackages || []).map((root) =>
        subpackagesMap[root].map((p) => `${root}/${p}`)
      )
    )
    .reduce((pV, cV) => {
      pV[cV] = true;
      return pV;
    }, {});
  const { miniprogramRoot } = getProjectConfig();
  const excludePagesMap = allPages.reduce((pV, cV) => {
    if (!includePagesMap[cV]) {
      ["wxml", "js", "wxss", "json"].forEach((s) => {
        const p = path.resolve(
          crtDir,
          config.projectConfigPath,
          "..",
          miniprogramRoot,
          `./${cV}.${s}`
        );
        pV[p] = true;
      });
    }
    return pV;
  }, {});
  return {
    includeMap: includePagesMap,
    excludeMap: excludePagesMap,
  };
}

/**
 * 镜像同步文件
 */
function mirrorFiles() {
  const { devDist } = getConfig();
  const { miniprogramRoot } = getProjectConfig();
  fs.removeSync(path.resolve(crtDir, devDist));
  const { includeMap, excludeMap } = getExcludePagesMap();
  fs.copy(
    path.resolve(crtDir, miniprogramRoot),
    path.resolve(crtDir, devDist),
    {
      filter(src) {
        if (excludeMap[src]) {
          return false;
        }
        return true;
      },
    }
  )
    .then(() => {
      console.log("mirror files done.");
      const pages = Object.keys(includeMap);
      return fs.writeJSON(getAppConfigPath(true), {
        ...getAppConfig(),
        subpackages: [],
        preloadRule: {},
        pages,
      }, {
        spaces: 2,
      })
        .then(() => {
          console.log("modify app.json done.");
        });
    })
    .catch(console.error);
}

mirrorFiles();
