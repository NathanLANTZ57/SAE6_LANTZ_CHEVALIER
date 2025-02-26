import FontAwesome from "@expo/vector-icons/FontAwesome";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/components/useColorScheme";

export {
  ErrorBoundary, // Capture les erreurs de navigation
} from "expo-router";

// 🔥 Assure que "home" est bien l'écran initial
export const unstable_settings = {
  initialRouteName: "home",
};

// Empêcher l'écran de démarrage de se cacher trop tôt
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        {/* 🔥 Home Screen affiché en premier */}
        <Stack.Screen name="home" options={{ headerShown: false }} />

        {/* 🔥 Correction : Assurer que "(tabs)/index" fonctionne bien */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        {/* 🔥 Navigation vers l'espace client */}
        <Stack.Screen name="client" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}
