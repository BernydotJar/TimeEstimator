/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  
  moduleDirectories: ["node_modules", "<rootDir>"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  rootDir: ".",  
  testEnvironment: 'jsdom',
  transform: {
      '^.+\\.(ts|tsx|js|jsx)?$': 'babel-jest',
    },
  transformIgnorePatterns: [
      "node_modules/(?!lucide-react)",],
    
};