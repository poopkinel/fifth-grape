import 'dotenv/config';

function isReactNativeMapsPlugin(plugin) {
  if (typeof plugin === 'string') return plugin === 'react-native-maps';
  if (Array.isArray(plugin)) return plugin[0] === 'react-native-maps';
  return false;
}

export default ({ config }) => ({
  ...config,
  ios: {
    ...config.ios,
    config: {
      googleMapsApiKey: process.env.IOS_GOOGLE_MAPS_API_KEY,
    },
  },
  plugins: [
    ...(config.plugins ?? []).filter((plugin) => !isReactNativeMapsPlugin(plugin)),
    [
      "react-native-maps",
      {
        androidGoogleMapsApiKey: process.env.ANDROID_GOOGLE_MAPS_API_KEY,
      },
    ],
  ],
  extra: {
    ...config.extra,
    eas: {
      projectId: process.env.PROJECT_ID,
    },
  },
});
