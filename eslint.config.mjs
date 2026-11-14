import js from '@eslint/js';
import prettier from 'eslint-config-prettier/flat';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import jsdoc from 'eslint-plugin-jsdoc';

const DOM_RULES = [
  'error',
  {
    selector: "AssignmentExpression > MemberExpression.left[property.name='innerHTML']",
    message: 'innerHTML is forbidden - build nodes with the DOM API.',
  },
  {
    selector: "AssignmentExpression > MemberExpression.left[property.name='outerHTML']",
    message: 'outerHTML is forbidden - build nodes with the DOM API.',
  },
  {
    selector: "CallExpression > MemberExpression.callee[property.name='insertAdjacentHTML']",
    message: 'insertAdjacentHTML is forbidden - build nodes with the DOM API.',
  },
];

export default [
  { ignores: ['dist/**', 'coverage/**', '_site/**', 'node_modules/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.ts'],
    plugins: { jsdoc },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.browser },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/no-explicit-any': 'error',
      'no-restricted-syntax': DOM_RULES,
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      eqeqeq: ['error', 'always'],
      'jsdoc/require-file-overview': 'error',
      'jsdoc/require-jsdoc': [
        'error',
        {
          enableFixer: false,
          publicOnly: { esm: true, cjs: false, window: false },
          require: {
            ArrowFunctionExpression: true,
            ClassDeclaration: true,
            ClassExpression: true,
            FunctionDeclaration: true,
            FunctionExpression: false,
            MethodDefinition: true,
          },
          contexts: [
            'TSInterfaceDeclaration',
            'TSTypeAliasDeclaration',
            'TSEnumDeclaration',
            'TSDeclareFunction',
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
    languageOptions: { ecmaVersion: 2022, globals: { ...globals.node } },
  },
  {
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: { ecmaVersion: 2022, globals: { ...globals.node } },
  },
  prettier,
];
