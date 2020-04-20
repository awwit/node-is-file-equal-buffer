module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['standard', 'prettier'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'standard',
    // Prettier always last
    'prettier',
    'prettier/standard',
    'plugin:prettier/recommended',
    'prettier/@typescript-eslint',
  ],
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module',
  },
  env: {
    node: true,
  },
  rules: {},
}
