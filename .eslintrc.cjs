module.exports = {
  root: true,
  env: { browser: true, node: true, es2023: true },
  extends: [
    'eslint:recommended',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true }
  },
  rules: {
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-console': 'warn'
  },
  overrides: [
    {
      files: ['client/src/**/*.{jsx,js}'],
      env: { browser: true },
      rules: {
        'react/jsx-key': 'warn',
        'react/no-unescaped-entities': 'off'
      }
    },
    {
      files: ['server/**/*.js'],
      env: { node: true }
    }
  ]
}
