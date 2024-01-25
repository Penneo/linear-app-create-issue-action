module.exports = {
  extends: [
    "plugin:github/recommended",
    "@cybozu/eslint-config/presets/node-typescript-prettier",
  ],
  plugins: ["jest", "github"],
  env: {
    node: true,
    es6: true,
    "jest/globals": true,
  },
  parserOptions: {
    ecmaVersion: 9,
    sourceType: "module",
    project: "./tsconfig.eslint.json",
  },
  rules: {
    "node/no-unsupported-features/es-syntax": "off",
    "filenames/match-regex": "off",
  },
};
