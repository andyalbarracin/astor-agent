// Metro para monorepo pnpm: observa el workspace y resuelve los paquetes
// @astor/* consumidos como TS source (Metro los transpila con babel).
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];
// Necesario para resolver los subpath exports de @astor/design-tokens (./mobile, …).
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
