const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

const defaultResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Metro sometimes fails to resolve styleq's relative dist import on Windows.
  if (moduleName === "./dist/transform-localize-style") {
    const originDir = path.dirname(context.originModulePath || "");
    return {
      type: "sourceFile",
      filePath: path.join(originDir, "dist", "transform-localize-style.js"),
    };
  }

  if (typeof defaultResolveRequest === "function") {
    return defaultResolveRequest(context, moduleName, platform);
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
