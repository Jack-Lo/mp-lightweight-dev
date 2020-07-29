const fs = require("fs-extra");
const path = require("path");
const watch = require('watch');
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
  const excludePagesMap = allPages.reduce((pV, cV) => {
    if (!includePagesMap[cV]) {
      ["wxml", "js", "wxss", "json"].forEach((s) => {
        const p = path.resolve(
          crtDir,
          config.projectConfigPath,
          "..",
          config.miniprogramRoot,
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
function monitorFiles() {
  const { miniprogramRoot, devDist } = getConfig();
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
      console.log("monitor files done.");
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
          watchFiles(path.resolve(crtDir, miniprogramRoot), src => {
            if (excludeMap[src]) {
              return false;
            }
            return true;
          });
        });
    })
    .catch(console.error);
}

monitorFiles();

/**
 * 监控文件变化
 */
function watchFiles(root, filter) {
  watch.createMonitor(root, { filter }, monitor => {
    monitor.on('created', (f, stat) => {
      // Handle new files
      console.log('created:', f);
    });
    monitor.on('changed', (f, curr, prev) => {
      // Handle file changes
      console.log('changed:', f);
    });
    monitor.on('removed', (f, stat) => {
      // Handle removed files
      console.log('removed:', f);
    });
  });
}
