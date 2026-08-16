import expoConfig from 'eslint-config-expo/flat.js';

const configWithoutReactRules = expoConfig.map(config => ({
  ...config,
  rules: Object.fromEntries(
    Object.entries(config.rules ?? {}).filter(([rule]) => !rule.startsWith('react/')),
  ),
}));

export default [
  ...configWithoutReactRules,
  {
    ignores: [
      'node_modules/**',
      'functions/node_modules/**',
      'Design_from _figma_/**',
      '.kilo/**',
      '.expo/**',
      'dist/**',
      'ce/**',
      'ce/dist/**',
      'functions/lib/**',
      'coverage/**',
      'playwright-report/**',
      'test-results/**',
    ],
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      'react-hooks/refs': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/preserve-manual-memoization': 'off',
      'react-hooks/static-components': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/immutability': 'off',
      'react-hooks/use-memo': 'off',
    },
  },
];
