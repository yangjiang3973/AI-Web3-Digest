import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginPrettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default [
    {
        files: ['**/*.{js,mjs,cjs,ts}'],
        languageOptions: { ecmaVersion: 'latest', sourceType: 'module' },
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    prettierConfig,
    { plugins: { prettier: eslintPluginPrettier } },
    {
        files: ['**/*.ts'],
        rules: {
            '@typescript-eslint/no-unused-vars': 'warn',
            //   'no-console': 'warn',
            'prettier/prettier': 'error',
        },
    },
    // add ignores
    {
        ignores: [
            'node_modules/**',
            'dist/**',
            'build/**',
            'coverage/**',
            'backups/**',
        ],
    },
];
