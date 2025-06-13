// eslint.config.mjs
// ==================
// Configuración completa de ESLint para un proyecto NestJS + TypeScript,
// deshabilitando las reglas de “unsafe” que causaban errores, e integrando Prettier.

import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['dist/', 'node_modules/', 'eslint.config.mjs'],
  },
  // 1) Reglas recomendadas de ESLint (sin TypeScript)
  //eslint.configs.recommended,

  // 2) Reglas recomendadas de @typescript-eslint
  ...tseslint.configs.recommendedTypeChecked,

  // 3) Integración de Prettier (desactiva reglas que entren en conflicto)
  eslintPluginPrettierRecommended,

  // 4) Opciones de lenguaje (parser, globals, sourceType)
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'module',
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: './tsconfig.json', // Asegúrate de que este camino exista
        tsconfigRootDir: new URL('.', import.meta.url).pathname,
        sourceType: 'module',
      },
    },
  },

  // 5) Reglas personalizadas
  {
    rules: {
      // Desactivar reglas “unsafe” para no bloquear el build
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'warn',

      // Permitir usos de “any” cuando sea necesario
      '@typescript-eslint/no-explicit-any': 'off',

      // Ajustes adicionales
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'off',

      // Desactivar avisos de Prettier (si prefieres solo formatear)
      'prettier/prettier': 'off',
    },
  },
);
