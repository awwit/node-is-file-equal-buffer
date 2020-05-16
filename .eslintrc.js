module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/typescript',
    'plugin:node/recommended',
    'plugin:promise/recommended',
    'standard',
    // Prettier always last
    'prettier',
    'plugin:prettier/recommended',
    'prettier/@typescript-eslint',
    'prettier/standard',
  ],
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module',
  },
  env: {
    node: true,
    jest: true,
  },
  rules: {
    'node/no-missing-import': 'off',
    'node/no-unsupported-features/es-syntax': 'off',
    'no-empty': ['error', { allowEmptyCatch: true }],
  },
}
