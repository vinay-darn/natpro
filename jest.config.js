module.exports = {
  preset: 'react-native',
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@reduxjs|@reduxjs\\/toolkit|immer|react-redux|lucide-react-native|react-native-image-picker|react-native-safe-area-context)/)'
  ],
  setupFiles: ['./jest.setup.js'],
};
