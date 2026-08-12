module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        'babel-preset-expo',
        {
          // Web (Metro) and native (Hermes) both need `import.meta` support so
          // `src/lib/firebase.ts`'s `import.meta.env` reads don't crash the app.
          unstable_transformImportMeta: true,
        },
      ],
    ],
    // Metro emits browser bundles as classic scripts. Some dependencies (notably
    // Zustand and React Router) contain `import.meta` even in code paths that
    // are not used by the app, which still causes the browser parser to fail.
    plugins: [
      function transformImportMeta() {
        return {
          visitor: {
            MetaProperty(path) {
              if (
                path.node.meta.name === 'import' &&
                path.node.property.name === 'meta'
              ) {
                path.replaceWithSourceString(
                  '({ env: {}, hot: undefined, url: undefined })',
                );
              }
            },
          },
        };
      },
    ],
  };
};
