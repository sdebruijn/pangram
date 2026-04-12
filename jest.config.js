module.exports = {
  testPathIgnorePatterns: ['/node_modules/', '/test-playwright/'],
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
  },
};
