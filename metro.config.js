// Metro configuration for the unified Cofkans Expo project.
//
// Expo SDK 54's Metro automatically reads the `paths` mapping from
// tsconfig.json (which already maps `@/*` → `./src/*`), so the web portal
// routes that import the real `src/app/...` components via `@/app/...`,
// `@/lib/...` resolve correctly on both native and web without a custom
// resolver. We just apply the Expo defaults.
//
// NOTE: package.json sets "type": "module", so this file is ESM.
import { getDefaultConfig } from 'expo/metro-config.js';
import { fileURLToPath } from 'url';
import * as path from 'path';

const projectRoot = fileURLToPath(new URL('.', import.meta.url)).replace(/\/$/, '');
const config = getDefaultConfig(projectRoot);

// Pin Metro to this project root so module resolution never walks up into the
// parent directory (which would resolve node_modules in the wrong place).
config.projectRoot = projectRoot;
config.watchFolders = [projectRoot];
config.resolver.nodeModulesPaths = [path.join(projectRoot, 'node_modules')];
config.resolver.extraNodeModules = {
  '@expo/metro-runtime': path.join(projectRoot, 'node_modules', '@expo', 'metro-runtime'),
};

export default config;
