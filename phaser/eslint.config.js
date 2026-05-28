// Minimal ESLint config — focused on catching the bug classes that wrecked us
// before (undefined identifiers, unused imports). Not a style enforcer.
import js from '@eslint/js';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        // The DEV-only diagnostic hooks attached in scenes/Game.js
        __state: 'readonly',
        __runtime: 'readonly',
        __game: 'readonly',
        __api: 'readonly'
      }
    },
    rules: {
      // The bug we hit: `clearCd is not defined` slipped past build because
      // ES modules don't validate identifiers at compile time.
      'no-undef': 'error',

      // Catches stale state writes that became dead code after refactor.
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],

      // Chinese full-width space (U+3000) is intentional inside zh-CN strings.
      'no-irregular-whitespace': ['error', { skipStrings: true, skipTemplates: true, skipComments: true }],

      // These are noise for this codebase.
      'no-useless-assignment': 'off',

      // Allow empty catch blocks (intentional in some persistence fallbacks).
      'no-empty': ['warn', { allowEmptyCatch: true }]
    }
  },
  {
    // Test probes use Playwright + browser-context evaluate; ignore unused
    // imports that exist for type assertions.
    files: ['test/**/*.mjs', 'src/**/*.test.js'],
    rules: { 'no-unused-vars': 'off' }
  }
];
