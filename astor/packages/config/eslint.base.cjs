/**
 * ESLint base compartida (Astor). Cada app/paquete extiende de acá y agrega
 * su entorno (Next, React Native, Node). Se mantiene mínima a propósito:
 * TypeScript estricto ya hace el trabajo pesado.
 */
module.exports = {
  root: false,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  env: {
    es2022: true,
  },
  rules: {
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
    '@typescript-eslint/consistent-type-imports': 'warn',
  },
  ignorePatterns: ['dist/', '.next/', 'node_modules/', '*.gen.ts'],
};
