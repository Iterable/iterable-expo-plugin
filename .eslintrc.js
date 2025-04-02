module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'expo',
    '@react-native',
    'plugin:react/recommended',
    'plugin:react-native/all',
  ],
  ignorePatterns: ['build'],
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      plugins: ['@typescript-eslint'],
      extends: [
        'plugin:@typescript-eslint/recommended',
      ],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: ['./tsconfig.json', './plugin/tsconfig.json'],
        tsconfigRootDir: __dirname,
      }
    },
    {
      files: ['plugin/src/**/*.ts', 'plugin/src/**/*.tsx'],
      rules: {
        // These are turned off for the plugin as it is actually run at build
        // time, so it is able to use require.
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/no-require-imports': 'off',
      },
    },
    {
      files: ['**/*.test.{js,ts,tsx}', '**/__mocks__/*', '**/__tests__/*'],
      plugins: ['jest'],
      env: {
        jest: true,
      },
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/no-require-imports': 'off',
      },
    },
  ],
};
