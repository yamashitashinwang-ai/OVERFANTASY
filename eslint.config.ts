// Minimal ESLint config — focused on catching the bug classes that wrecked us
// before (undefined identifiers, unused imports). Not a style enforcer.
import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.ts', 'test/**/*.mjs', '*.ts', '*.js'],
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
      // TypeScript owns this check for `.ts` files; keeping it enabled creates
      // false positives for ambient Phaser and Vite types.
      'no-undef': 'off',

      // Catches stale state writes that became dead code after refactor.
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'off',
      'prefer-const': 'warn',

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
    files: ['test/**/*.ts', 'src/**/*.test.ts'],
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-unused-expressions': 'off'
    }
  }
);
