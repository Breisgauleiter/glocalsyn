/* Shared ESLint config for monorepo */
module.exports = {
  root: true,
  ignorePatterns: ['**/dist/**', '**/build/**', '**/coverage/**', '**/test-results/**', '**/.turbo/**'],
  env: { es2023: true },
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
  },
  overrides: [
    {
      files: ['apps/app/**/*.{ts,tsx}'],
      env: { browser: true },
      plugins: ['react', 'react-hooks', 'jsx-a11y', 'testing-library', 'jest-dom'],
      extends: [
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
        'plugin:jsx-a11y/recommended',
        'plugin:testing-library/react',
        'plugin:jest-dom/recommended',
      ],
      settings: { react: { version: 'detect' } },
      rules: {
        'react/react-in-jsx-scope': 'off',
        'jsx-a11y/no-redundant-roles': 'off',
        'no-empty': 'warn',
        '@typescript-eslint/ban-ts-comment': ['warn', { 'ts-expect-error': 'allow-with-description', 'ts-ignore': 'allow-with-description' }],
      },
    },
    {
      files: ['services/graph/**/*.{ts,tsx}'],
      env: { node: true },
      plugins: ['n'],
      extends: ['plugin:n/recommended'],
    },
    {
      files: ['**/*.{test,spec}.{ts,tsx}'],
      rules: {
        // keep tests lightweight; disable some stylistic rules
        'no-empty': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',
      },
    },
  ],
};
