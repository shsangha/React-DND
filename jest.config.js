module.exports = {
  roots: ["<rootDir>/src"],
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "\\.scss$": "identity-obj-proxy",
    "\\.module\\.scss$": "identity-obj-proxy"
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  setupFiles: ["jest-localstorage-mock"],
  setupTestFrameworkScriptFile: "<rootDir>enzyme.config.ts",
  transform: {
    "^.+\\.tsx?$": "ts-jest",
    "\\.(gql|graphql)$": "jest-transform-graphql"
  },
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$",
  collectCoverageFrom: ["**/src/**/*.ts(x)"]
};
