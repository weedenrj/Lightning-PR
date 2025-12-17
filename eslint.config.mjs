import js from '@eslint/js'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsparser from '@typescript-eslint/parser'
import react from 'eslint-plugin-react'

export default [
  {
    ignores: ['.opencode-reference/**'],
  },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        Bun: 'readonly',
        setTimeout: 'readonly',
        process: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      react: react,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...react.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/no-unknown-property': 'off',
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react',
              importNames: ['useEffect', 'useMemo', 'useCallback'],
              message: 'useEffect, useMemo, and useCallback are not allowed in this project.',
            },
          ],
        },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: "ImportSpecifier[imported.name='useEffect']",
          message: 'useEffect is not allowed in this project.',
        },
        {
          selector: "ImportSpecifier[imported.name='useMemo']",
          message: 'useMemo is not allowed in this project.',
        },
        {
          selector: "ImportSpecifier[imported.name='useCallback']",
          message: 'useCallback is not allowed in this project.',
        },
        {
          // This selector catches both standard functions and arrow functions being invoked immediately
          selector: "CallExpression[callee.type=/^(FunctionExpression|ArrowFunctionExpression)$/]",
          message: "IIFEs (Immediately Invoked Function Expressions) are not allowed. Use block scopes or standard function declarations instead."
        }
      ],
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
]
