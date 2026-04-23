import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default [
  // Global ignores
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/prisma/generated/**',
      '**/*.d.ts',
      '**/*.js',
      '**/*.mjs',
      '**/*.cjs'
    ]
  },

  // Base JS recommended config
  js.configs.recommended,

  // TypeScript config for source files
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
        project: './tsconfig.json',
        tsconfigRootDir: __dirname
      },
      globals: {
        // Node.js globals
        process: 'readonly',
        console: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        // ES2021 globals
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly',
        // Test globals
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        before: 'readonly',
        after: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'import': importPlugin
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.json'
        },
        node: true
      }
    },
    rules: {
      // TypeScript rules
      // '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/naming-convention': 'off',

      // Import rules
      'import/no-relative-packages': 'off',
      'import/extensions': [
        'error',
        'ignorePackages',
        { ts: 'never', tsx: 'never' }
      ],
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index'
          ],
          alphabetize: { order: 'asc', caseInsensitive: true },
          'newlines-between': 'always'
        }
      ],

      // Custom rules
      "max-lines": ["error", { max: 100, skipComments: true }],
      'no-shadow': 'off',
      '@typescript-eslint/no-shadow': 'error',
      'no-empty': ['error', { allowEmptyCatch: true }],
      'no-restricted-syntax': ['off', 'ForOfStatement'],
      'no-useless-constructor': 'off',
      'no-empty-function': ['error', { allow: ['constructors', 'arrowFunctions'] }],
      'class-methods-use-this': 'off',
      'import/prefer-default-export': 'off',
      'no-console': ['warn', { allow: ['error', 'info'] }],
      'no-unused-vars': 'off',
      'no-underscore-dangle': 'off',
      'consistent-return': 'off',
      'lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],
      'padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: '*', next: 'return' },
        { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
        { blankLine: 'any', prev: ['const', 'let', 'var'], next: ['const', 'let', 'var'] },
        { blankLine: 'always', prev: 'directive', next: '*' },
        { blankLine: 'always', prev: 'block-like', next: '*' },
        { blankLine: 'always', prev: '*', next: 'block-like' },
        { blankLine: 'always', prev: 'block-like', next: 'block-like' }
      ],
      'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 1 }],
      'eol-last': ['error', 'always'],
      'comma-dangle': ['error', 'only-multiline'],
      'semi': ['error', 'always'],
      'quotes': ['error', 'single', { avoidEscape: true, allowTemplateLiterals: true }],
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      'comma-spacing': ['error', { before: false, after: true }],
      'space-before-blocks': 'error',
      'space-before-function-paren': ['error', {
        anonymous: 'always',
        named: 'never',
        asyncArrow: 'always'
      }],
      'space-in-parens': ['error', 'never'],
      'space-infix-ops': 'error',
      'space-unary-ops': 'error',
      'spaced-comment': ['error', 'always', { exceptions: ['-', '+'] }],
      'arrow-spacing': 'error',
      'prefer-const': 'error',
      'prefer-arrow-callback': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
      'dot-notation': 'error',
      'one-var': ['error', 'never'],
      'no-multi-spaces': 'error',
      'key-spacing': ['error', { beforeColon: false, afterColon: true }],
      'keyword-spacing': ['error', { before: true, after: true }],
      'func-call-spacing': ['error', 'never'],
      'block-spacing': 'error',
      'computed-property-spacing': ['error', 'never'],
      'brace-style': ['error', '1tbs', { allowSingleLine: true }],
      'camelcase': ['error', { properties: 'never' }],
      'new-cap': ['error', { newIsCap: true, capIsNew: false }],
      'no-array-constructor': 'error',
      'no-new-object': 'error',
      'no-multi-assign': 'error',
      'no-plusplus': 'off',
      'no-param-reassign': 'off',
      'no-await-in-loop': 'off',
      'no-restricted-syntax': 'off',
      'no-return-await': 'error',
      'no-throw-literal': 'error',
      'prefer-promise-reject-errors': 'error',
      'require-await': 'off',
      'no-return-await': 'off',
      '@typescript-eslint/return-await': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/promise-function-async': 'error',
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          "args": "all",
          // "caughtErrors": "all",
          // "caughtErrorsIgnorePattern": "^_",
          // "destructuredArrayIgnorePattern": "^_",
          // "ignoreRestSiblings": true,

          "argsIgnorePattern": "^_",
          "varsIgnorePattern": "^_",
        }
      ],
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'interface',
          format: ['PascalCase'],
          custom: { regex: '^I[A-Z]', match: true }
        }
      ]
    }
  }
];
