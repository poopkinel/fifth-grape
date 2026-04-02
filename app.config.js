import 'dotenv/config';

export default ({ config }) => ({
  ...config,
  ios: {
    ...config.ios,
    config: {
      googleMapsApiKey: process.env.EXPO_PUBLIC_IOS_GOOGLE_MAPS_API_KEY,
    },
  },
  plugins: [
    ...config.plugins,
    [
        "react-native-maps",
        {
            androidGoogleMapsApiKey: process.env.EXPO_PUBLIC_ANROID_GOOGLE_MAPS_API_KEY
        }
    ]
  ],
  extra: {
    ...config.extra,
    // apiKey: process.env.SECRET_API_KEY,
    eas: {
      projectId: process.env.EXPO_PUBLIC_PROJECT_ID
    },
  },
});
