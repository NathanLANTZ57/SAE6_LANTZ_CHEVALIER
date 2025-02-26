import FontAwesome from "@expo/vector-icons/FontAwesome";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { registerForPushNotificationsAsync } from "../constants/notifications"; // Import du fichier notifications.ts

import { useColorScheme } from "@/components/useColorScheme";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "home",
};

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
  const router = useRouter();

  useEffect(() => {
    // 🎯 Enregistrer le token pour les notifications
    const setupNotifications = async () => {
      const token = await registerForPushNotificationsAsync();
      if (token) {
        await AsyncStorage.setItem("expoPushToken", token);
      }
    };
    setupNotifications();

    // 🎯 Gestion du clic sur une notification
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const screen = response.notification.request.content.data.screen;
      if (screen) {
        router.push(`/${screen}`);
      }
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    const testRedirection = async () => {
      setTimeout(() => {
        router.push("/client"); // Simule un clic sur la notification
      }, 5000); // Attend 5 secondes après le démarrage de l'application
    };
  
    testRedirection();
  }, []);
  

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="home" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="client" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}
