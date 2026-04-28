import { useColorScheme } from "react-native";
import { Colors, darkColors, lightColors } from "./colors";

export function useTheme(): Colors {
  const scheme = useColorScheme();
  return scheme === "dark" ? darkColors : lightColors;
}
