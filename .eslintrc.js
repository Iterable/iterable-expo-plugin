module.exports = require('expo-module-scripts/eslintrc.base.js');

// module.exports = {
//   root: true,
//   extends: [
//     'eslint:recommended',
//     'expo',
//     '@react-native',
//     'plugin:react/recommended',
//     'plugin:react-native/all',
//   ],
//   ignorePatterns: ['build'],
//   parserOptions: {
//     requireConfigFile: false,
//     ecmaVersion: 2020,
//     sourceType: 'module',
//   },
//   settings: {
//     'import/resolver': {
//       typescript: {
//         project: ['./tsconfig.json', './plugin/tsconfig.json'],
//       },
//       node: {
//         extensions: ['.js', '.jsx', '.ts', '.tsx'],
//       },
//     },
//   },
//   overrides: [
//     {
//       files: ['*.ts', '*.tsx'],
//       plugins: ['@typescript-eslint'],
//       extends: [
//         'plugin:@typescript-eslint/recommended',
//       ],
//       parser: '@typescript-eslint/parser',
//       parserOptions: {
//         project: ['./tsconfig.json', './plugin/tsconfig.json'],
//         tsconfigRootDir: __dirname,
//       },
//       rules: {
//         '@typescript-eslint/func-call-spacing': 'off',
//         'import/namespace': 'off',
//         'import/no-unresolved': 'off',
//       },
//     },
//     {
//       files: ['plugin/src/**/*.ts', 'plugin/src/**/*.tsx'],
//       rules: {
//         '@typescript-eslint/no-var-requires': 'off',
//         '@typescript-eslint/no-require-imports': 'off',
//       },
//     },
//     {
//       files: ['**/*.test.{js,ts,tsx}', '**/__mocks__/*', '**/__tests__/*'],
//       plugins: ['jest'],
//       env: {
//         jest: true,
//       },
//       rules: {
//         '@typescript-eslint/no-var-requires': 'off',
//         '@typescript-eslint/no-require-imports': 'off',
//       },
//     },
//   ],
// };
