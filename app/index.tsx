import { I18nManager } from "react-native";

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

import { Redirect } from "expo-router";
export default function Index() {
  return <Redirect href="/(tabs)/home" />;
}