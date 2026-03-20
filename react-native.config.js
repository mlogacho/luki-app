/**
 * React Native CLI configuration.
 *
 * Excludes `react-native-worklets-core` from native auto-linking on Android
 * and iOS because it is a transitive peer dependency of React Native
 * Reanimated that does not need to be linked independently on these platforms.
 * Without this exclusion the CLI would attempt (and fail) to link it twice.
 */
module.exports = {
    dependencies: {
        'react-native-worklets': {
            platforms: {
                android: null, // Disable Android linking
                ios: null,     // Disable iOS linking
            },
        },
    },
};
