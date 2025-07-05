import reactPlugin from "eslint-plugin-react";
import prettierPlugin from "eslint-plugin-prettier";

export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      globals: {
        window: "readonly",
        document: "readonly",
        console: "readonly",
        module: "readonly",
        require: "readonly",
        process: "readonly"
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    plugins: {
      react: reactPlugin,
      prettier: prettierPlugin
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      "prettier/prettier": "warn",
      "react/no-unescaped-entities": "off",
      "react/no-unknown-property": "off"
    },
    settings: {
      react: {
        version: "detect"
      }
    }
  },
  {
    ignores: ["node_modules/**", ".next/**"]
  }
];